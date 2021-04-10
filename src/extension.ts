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
		'extension.nestComment',
		() => {
			// The code you place here will be executed every time your command is executed
			nestComments.updateNestComment();
			// Display a message box to the user
			//   vscode.window.showInformationMessage('Hello World!');
		}
	);
	// The commandId parameter must match the command field in package.json
	let disposable2 = vscode.commands.registerCommand(
		'extension.nestUncomment',
		() => {
			// The code you place here will be executed every time your command is executed
			nestComments.updateNestUncomment();
			// Display a message box to the user
			//   vscode.window.showInformationMessage('Hello World!');
		}
	);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

class NestComments {

	public updateNestComment() {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const doc = editor.document;
		const supported = [
			'asp',
			'cfm',
			'c',
			'cpp',
			'csharp',
			'java',
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

			let mod_text = '';

			switch (doc.languageId) {
				case 'css':
				case 'cpp':
				case 'c':
				case 'csharp':
				case 'java':
				case 'javascript':
				case 'typescript':
					mod_text = text.replace(/\/\*/g, '/~');
					mod_text = mod_text.replace(/\*\//g, '~/');
					mod_text = '/*' + mod_text + '*/';
				 	break;

				 case 'javascriptreact':
				 case 'typescriptreact':
					mod_text = text.replace(/\/\*/g, '/~');
					mod_text = mod_text.replace(/\*\//g, '~/');
					mod_text = '{/*' + mod_text + '*/}';
				 	break;

				 case 'twig':
					mod_text = text.replace(/{\#/g, '{~#');
					mod_text = mod_text.replace(/\#}/g, '#~}');
					mod_text = '{# ' + mod_text + ' #}';
				 	break;

				default:
					mod_text = this.CommentXML(text);
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
	public updateNestUncomment() {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const doc = editor.document;
		const supported = [
			'asp',
			'cfm',
			'c',
			'cpp',
			'csharp',
			'java',
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

			let mod_text = '';

			switch (doc.languageId) {
				case 'css':
				case 'cpp':
				case 'c':
				case 'csharp':
				case 'java':
				case 'javascript':
				case 'typescript':
					mod_text = text.replace(/\/\*/g, '');
					mod_text = mod_text.replace(/\*\//g, '');
					mod_text = mod_text.replace(/\/~/g, '/*');
					mod_text = mod_text.replace(/\~\//g, '*/');
				 	break;

				 case 'javascriptreact':
				 case 'typescriptreact':
					mod_text = text.replace(/{\/\*/g, '');
					mod_text = mod_text.replace(/\*\/}/g, '');
					mod_text = mod_text.replace(/\/~/g, '/*');
					mod_text = mod_text.replace(/\~\//g, '*/');
				 	break;

				 case 'twig':
					mod_text = text.replace(/{\# /g, '');
					mod_text = mod_text.replace(/ \#}/g, '');
					mod_text = mod_text.replace(/{\~\#/g, '{#');
					mod_text = mod_text.replace(/\#\~}/g, '#}');
				 	break;

				default:
					mod_text = this.UncommentXML(text);
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

	private CommentXML(text: string): string {
		text=this.CommentXMLRec(text, '<!~~', '~~>', 1);

		text = text.replace(/<!--/g, '<!~~');
		text = text.replace(/-->/g, '~~>');

		text = '<!--' + text + '-->';

		return text;
	}
	private CommentXMLRec(text: string, lastLevelStart: string, lastLevelEnd: string, level: number): string {
		let nextLevelStart = '<!~' + level.toString();
		let nextLevelEnd = level.toString() + '~>';

		if (text.indexOf(lastLevelStart) != -1) {
			text=this.CommentXMLRec(text,nextLevelStart,nextLevelEnd,level+1);

			text = text.replace(new RegExp(lastLevelStart,'g'), nextLevelStart);
			text = text.replace(new RegExp(lastLevelEnd,'g'), nextLevelEnd);
		}

		return text;
	}

	
	private UncommentXML(text: string): string {
		text=this.UncommentXMLRec(text, '', '', -1);

		return text;
	}
	private UncommentXMLRec(text: string, lastLevelStart: string, lastLevelEnd: string, level: number): string {
		let nextLevelStart;
		let nextLevelEnd;

		switch (level) {
			case -1:
				nextLevelStart = '<!--';
				nextLevelEnd =   '-->';
				break;

			case 0:
				nextLevelStart = '<!~~';
				nextLevelEnd =   '~~>';
				break;

			default:
				nextLevelStart = '<!~' + level.toString();
				nextLevelEnd = level.toString() + '~>';
				break;
		}

		if (text.indexOf(nextLevelStart) != -1) {
			text = text.replace(new RegExp(nextLevelStart,'g'), lastLevelStart);
			text = text.replace(new RegExp(nextLevelEnd,'g'), lastLevelEnd);

			text=this.UncommentXMLRec(text,nextLevelStart,nextLevelEnd,level+1);
		}

		return text;
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
