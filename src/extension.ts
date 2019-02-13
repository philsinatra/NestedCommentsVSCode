'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "html-nested-comments" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  let nestComments = new NestComments();
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.nestComments',
    () => {
      // The code you place here will be executed every time your command is executed
      nestComments.updateNestedComments();
      // Display a message box to the user
      //   vscode.window.showInformationMessage('Hello World!');
    }
  );

  context.subscriptions.push(disposable);
}

function isWhitespace(character:string) {
  return character === ' ' || character === '\r' || character === '\n' || character === '\t';
}

function extendWhitespaceOffset(text:string, offset:number, reverse:boolean, maxLines:number = Infinity) {
  const delta = reverse ? -1 : 1;
  while (reverse ? offset > 0 : offset < text.length) {
    const character = text.charAt(reverse ? offset - 1 : offset);
    if (!isWhitespace(character)) {
      break;
    }
    offset += delta;
    if (character === '\r' || character === '\n') {
      const nextCharacter = text.charAt(offset + delta);
      if (
        (nextCharacter === '\r' || nextCharacter === '\n') &&
        character != nextCharacter
      ) {
        offset += delta;
      }
      if (--maxLines <= 0) {
        break;
      }
    }
  }
  return offset;
}

class FragmentRange {
  index:number = -1;
  start:number = -1;
  end:number = -1;
  isDocBlock:boolean = false;

  constructor(text:string, search:string, offset:number, reverse:boolean) {
    // Shift search offset to edge of padding
    offset = extendWhitespaceOffset(text, offset, !reverse);
    if (reverse) {
      this.index = text.lastIndexOf(search, offset);
    } else {
      // Note the adjustment by search.length
      this.index = text.indexOf(search, offset/* - search.length*/);
    }
    if (this.index === -1) {
      return;
    }
    // If there was a match then the match positions are again extended past whitespace
    this.start = extendWhitespaceOffset(text, this.index, true);
    this.end = extendWhitespaceOffset(text, this.index + search.length, false);
    this.isDocBlock = text.substring(this.index, this.index + 3) === '/**';
  }

  contains(offset:number) {
    return offset >= this.start && offset <= this.end;
  }

  exists() {
    return this.index !== -1;
  }
}

function decreaseCommentNesting(text:string, descriptor:any) {
  let index = 0;
  let depth = 0;
  while (true) {
    let openIndex = text.indexOf(descriptor.fake[0], index);
    let closeIndex = text.indexOf(descriptor.fake[1], index);
    if (openIndex !== -1 && openIndex < closeIndex) {
      if (depth === 0) {
        text = text.substring(0, openIndex) + descriptor.real[0] + text.substring(openIndex + descriptor.fake[0].length);
      }
      index = openIndex + 1;
      ++depth;
    } else if (closeIndex !== -1) {
      index = closeIndex + 1;
      --depth;
      if (depth === 0) {
        text = text.substring(0, closeIndex) + descriptor.real[1] + text.substring(closeIndex + descriptor.fake[1].length);
      }
    } else {
      break;
    }
  }
  return text;
}

function replaceAll(text:string, search:string, replace:string) {
  // It is 2019 and JavaScript still doesn't have a raw string find & replace all method,
  // so this needs to be escaped.
  const escaped = search.replace(/./g, function(character:string) {
    return `\\x${character.charCodeAt(0).toString(16)}`;
  });
  return text.replace(new RegExp(escaped, 'g'), replace);
}

function increaseCommentNesting(text:string, descriptor:any) {
  text = replaceAll(text, descriptor.real[0], descriptor.fake[0]);
  return replaceAll(text, descriptor.real[1], descriptor.fake[1]);
}

class NestComments {
  public updateNestedComments() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const doc = editor.document;
    const c_like = {
      real: ['/*', '*/'],
      fake: ['/~', '~/'],
    };
    const jsx = {
      real: ['{/*', '*/}'],
      fake: ['/~', '~/' ],
    };
    const xml = {
      real: ['<!--', '-->'],
      fake: ['<!~~', '~~>'],
    };
    const supported = {
      'asp': xml,
      'c': c_like,
      'cpp': c_like,
      'csharp': c_like,
      'cfm': xml,
      'css': c_like,
      'htm': xml,
      'html': xml,
      'java': c_like,
      'javascript': c_like,
      'javascriptreact': jsx,
      'md': xml,
      'njk': xml,
      'objective-c': c_like,
      'objective-cpp': c_like,
      'php': xml,
      'ruby': {
        real: ['\n=begin\n', '\n=end'],
        fake: ['\n~begin\n', '\n~end'],
      },
      'twig': {
        real: ['{#', '#}'],
        fake: ['{~#', '#~}'],
      },
      'svg': xml,
      'swift': c_like,
      'typescript': c_like,
      'typescriptreact': jsx,
      'vue': xml,
      'xml': xml,
      'xsl': xml,
    };

    const descriptor = supported[doc.languageId];
    if (descriptor === undefined) {
      vscode.window.showInformationMessage(`File format '${doc.languageId}' not supported!`);
      return;
    }

    const text = doc.getText();
    const selection = editor.selection;
    const leftOffset = doc.offsetAt(selection.start);
    const rightOffset = doc.offsetAt(selection.end);

    let leftGutterStart:number, leftGutterLength:number = 0;
    let rightGutterStart:number, rightGutterLength:number = 0;
    let textStart:number, textEnd:number;
    let leftFragment:string = '', rightFragment:string = '';
    let newText:string;

    const leftOpenComment = new FragmentRange(text, descriptor.real[0], leftOffset, true);
    const leftCloseComment = new FragmentRange(
      text, descriptor.real[1],
      // This prevents a comment like /*/ from being interpreted as both open and close
      Math.min(leftOpenComment.exists() ? leftOpenComment.index : Infinity, leftOffset),
      true
    );
    const nextOpenComment = new FragmentRange(text, descriptor.real[0], leftOffset, false);
    const nextCloseComment = new FragmentRange(text, descriptor.real[1], leftOffset, false);
    const rightPrevOpenComment = new FragmentRange(text, descriptor.real[0], rightOffset, true);
    const rightPrevCloseComment = new FragmentRange(text, descriptor.real[1], rightOffset, true);

    if (
      leftOpenComment.exists() &&
      (!leftCloseComment.exists() || leftCloseComment.index < leftOpenComment.index) &&
      (!nextCloseComment.exists() ||
      rightOffset < nextCloseComment.index || nextCloseComment.contains(rightOffset))
    ) {
      // Uncommenting a block
      if (leftOpenComment.contains(leftOffset) && !leftOpenComment.isDocBlock) {
        // Left intersects with uncommented area
        leftGutterStart = leftOpenComment.index;
        leftGutterLength = descriptor.real[0].length;
        textStart = Math.max(leftOffset, leftOpenComment.index + descriptor.real[0].length);
      } else {
        leftGutterStart = extendWhitespaceOffset(text, leftOffset, true, 1);
        leftFragment = descriptor.real[1];
      }
      if (nextCloseComment.contains(rightOffset) && !leftOpenComment.isDocBlock) {
        // Right intersects with an existing comment
        rightGutterStart = nextCloseComment.index;
        rightGutterLength = descriptor.real[1].length;
        textEnd = Math.min(rightOffset, nextCloseComment.index);
      } else {
        rightGutterStart = extendWhitespaceOffset(text, rightOffset, false, 1);
        rightFragment = descriptor.real[0];
      }
      // Splice the comment
      textStart = textStart || leftOffset;
      textEnd = textEnd || rightOffset;
      newText = text.substring(textStart, textEnd);
      newText = decreaseCommentNesting(newText, descriptor);
    } else if (
      (!leftOpenComment.exists() ||
      (leftCloseComment.exists() && leftOpenComment.index < leftCloseComment.index)) &&
      (
        !rightPrevCloseComment.exists() ||
        rightPrevCloseComment.index <= leftCloseComment.index ||
        (rightPrevOpenComment.exists() && (
          rightPrevOpenComment.index < rightPrevCloseComment.index ||
          rightPrevOpenComment.contains(rightOffset))
        )
      )
    ) {
      // Commenting a block
      if (leftCloseComment.contains(leftOffset) && !leftOpenComment.isDocBlock) {
        // Left intersects with an existing comment
        leftGutterStart = leftCloseComment.index;
        leftGutterLength = descriptor.real[1].length;
        textStart = Math.max(leftOffset, leftCloseComment.index + descriptor.real[1].length);
      } else {
        leftFragment = descriptor.real[0];
      }
      if (nextOpenComment.contains(rightOffset) && !nextOpenComment.isDocBlock) {
        // Right intersects with an existing comment
        rightGutterStart = nextOpenComment.index;
        rightGutterLength = descriptor.real[0].length;
        textEnd = Math.min(rightOffset, nextOpenComment.index);
      } else if (rightPrevOpenComment.contains(rightOffset) && !rightPrevOpenComment.isDocBlock) {
        // Right intersects with an existing comment
        rightGutterStart = rightPrevOpenComment.index;
        rightGutterLength = descriptor.real[0].length;
        textEnd = Math.min(rightOffset, rightPrevOpenComment.index);
      } else {
        rightFragment = descriptor.real[1];
      }
      // Splice the comment
      textStart = textStart || leftOffset;
      textEnd = textEnd || rightOffset;
      newText = text.substring(textStart, textEnd);
      newText = increaseCommentNesting(newText, descriptor);
    }

    if (newText !== undefined) {
      const edit = new vscode.WorkspaceEdit();
      if (leftGutterStart === undefined) {
        leftGutterStart = textStart;
      }
      if (rightGutterStart === undefined) {
        rightGutterStart = textEnd;
      }
      const range = new vscode.Range(doc.positionAt(leftGutterStart), doc.positionAt(rightGutterStart + rightGutterLength));
      edit.replace(doc.uri, range,
        leftFragment +
        text.substring(leftGutterStart + leftGutterLength, textStart) +
        newText +
        text.substring(textEnd, rightGutterStart) +
        rightFragment
      );

      return vscode.workspace.applyEdit(edit).then(function() {
        editor.selection = new vscode.Selection(
          doc.positionAt(textStart + leftFragment.length - leftGutterLength),
          doc.positionAt(newText.length + textStart + leftFragment.length - leftGutterLength)
        );
      });
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
