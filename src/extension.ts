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
    'Congratulations, your extension "nested-comments" is now active!'
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

class NestComments {
  public updateNestedComments() {
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const doc = editor.document;
    const supported = [
      'asp',
      'cfm',
      'css',
      'htm',
      'html',
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'md',
      'njk',
      'php',
      'twig',
      'svg',
      'vue',
      'xml',
      'xsl'
    ];

    if (supported.indexOf(doc.languageId) > -1) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);

      let prefix;
      let mod_text = '';

      switch (doc.languageId) {
      case 'css':
      case 'javascript':
      case 'typescript':
        prefix = text.substring(0, 2);
        if (prefix !== '/*') {
          mod_text = text.replace(/\/\*/g, '/~');
          mod_text = mod_text.replace(/\*\//g, '~/');
          mod_text = '/*' + mod_text + '*/';
        } else {
          mod_text = text.replace(/\/\*/g, '');
          mod_text = mod_text.replace(/\/\*/g, '');
          mod_text = mod_text.replace(/\*\//g, '');
          mod_text = mod_text.replace(/\/~/g, '/*');
          mod_text = mod_text.replace(/\~\//g, '*/');
        }
        break;

      case 'javascriptreact':
      case 'typescriptreact':
        prefix = text.substring(0, 3);
        if (prefix !== '{/*') {
          mod_text = text.replace(/\/\*/g, '/~');
          mod_text = mod_text.replace(/\*\//g, '~/');
          mod_text = '{/*' + mod_text + '*/}';
        } else {
          mod_text = text.replace(/{\/\*/g, '');
          mod_text = mod_text.replace(/\*\/}/g, '');
          mod_text = mod_text.replace(/\/~/g, '/*');
          mod_text = mod_text.replace(/\~\//g, '*/');
        }
        break;

      case 'twig':
        prefix = text.substring(0, 2);
        if (prefix !== '{#') {
          mod_text = text.replace(/{\#/g, '{~#');
          mod_text = mod_text.replace(/\#}/g, '#~}');
          mod_text = '{# ' + mod_text + ' #}';
        } else {
          mod_text = text.replace(/{\# /g, '');
          mod_text = mod_text.replace(/ \#}/g, '');
          mod_text = mod_text.replace(/{\~\#/g, '{#');
          mod_text = mod_text.replace(/\#\~}/g, '#}');
        }
        break;

      default:
        prefix = text.substring(0, 4);
        if (prefix !== '<!--') {
          mod_text = text.replace(/<!--/g, '<!~~');
          mod_text = mod_text.replace(/-->/g, '~~>');
          mod_text = '<!-- ' + mod_text + ' -->';
        } else {
          mod_text = text.replace(/<!-- /g, '');
          mod_text = mod_text.replace(/<!--/g, '');
          mod_text = mod_text.replace(/-->/g, '');
          mod_text = mod_text.replace(/<!~~/g, '<!--');
          mod_text = mod_text.replace(/~~>/g, '-->');
        }
        break;
      }

      let edit = new vscode.WorkspaceEdit();

      const startPos: vscode.Position = new vscode.Position(
        selection.start.line,
        selection.start.character
      );
      const endPos: vscode.Position = new vscode.Position(
        selection.start.line + text.split(/\r\n|\r|\n/).length - 1,
        selection.start.character + text.length
      );

      const range = new vscode.Range(startPos, endPos);

      edit.replace(editor.document.uri, range, mod_text);
      return vscode.workspace.applyEdit(edit);
    } else {
      vscode.window.showInformationMessage('File format not supported!');
    }
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
