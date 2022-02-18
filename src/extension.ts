import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "Nested Comments" is now active!')
	let nestComments = new NestComments()

	let disposable = vscode.commands.registerCommand('extension.nestComments', () => {
		nestComments.updateNestedComments()
	})

	context.subscriptions.push(disposable)
}

class NestComments {
	public updateNestedComments() {
		let editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}

		const doc = editor.document
		const supported = [
			'asp',
			'cfm',
			'css',
			'htm',
			'html',
			'javascriptreact',
			'typescriptreact',
			'md',
			'njk',
			'php',
			'twig',
			'svelte',
			'svg',
			'tpl',
			'vue',
			'xml',
			'xsl'
		]

		if (supported.indexOf(doc.languageId) > -1) {
			const selection = editor.selection
			const text = editor.document.getText(selection)

			let prefix
			let modText = ''

			switch (doc.languageId) {
				case 'css':
					prefix = text.substring(0, 2)
					if (prefix !== '/*') {
						modText = text.replace(/\/\*/g, '/~')
						modText = modText.replace(/\*\//g, '~/')
						modText = '/*' + modText + '*/'
					} else {
						modText = text.replace(/\/\*/g, '')
						modText = modText.replace(/\/\*/g, '')
						modText = modText.replace(/\*\//g, '')
						modText = modText.replace(/\/~/g, '/*')
						modText = modText.replace(/\~\//g, '*/')
					}
					break

				case 'javascriptreact':
				case 'typescriptreact':
					prefix = text.substring(0, 3)
					if (prefix !== '{/*') {
						modText = text.replace(/\/\*/g, '/~')
						modText = modText.replace(/\*\//g, '~/')
						modText = '{/*' + modText + '*/}'
					} else {
						modText = text.replace(/{\/\*/g, '')
						modText = modText.replace(/\*\/}/g, '')
						modText = modText.replace(/\/~/g, '/*')
						modText = modText.replace(/\~\//g, '*/')
					}
					break

				case 'tpl':
				case 'twig':
					prefix = text.substring(0, 2)
					if (prefix !== '{#') {
						modText = text.replace(/{\#/g, '{~#')
						modText = modText.replace(/\#}/g, '#~}')
						modText = '{# ' + modText + ' #}'
					} else {
						modText = text.replace(/{\# /g, '')
						modText = modText.replace(/ \#}/g, '')
						modText = modText.replace(/{\~\#/g, '{#')
						modText = modText.replace(/\#\~}/g, '#}')
					}
					break

				default:
					prefix = text.substring(0, 4)
					if (prefix !== '<!--') {
						modText = text.replace(/<!--/g, '<!~~')
						modText = modText.replace(/-->/g, '~~>')
						modText = '<!-- ' + modText + ' -->'
					} else {
						modText = text.replace(/<!-- /g, '')
						modText = modText.replace(/<!--/g, '')
						modText = modText.replace(/-->/g, '')
						modText = modText.replace(/<!~~/g, '<!--')
						modText = modText.replace(/~~>/g, '-->')
					}
					break
			}

			let edit = new vscode.WorkspaceEdit()

			const startPos: vscode.Position = new vscode.Position(
				selection.start.line,
				selection.start.character
			)
			const endPos: vscode.Position = new vscode.Position(
				selection.start.line + text.split(/\r\n|\r|\n/).length - 1,
				selection.start.character + text.length
			)

			const range = new vscode.Range(startPos, endPos)

			edit.replace(editor.document.uri, range, modText)
			return vscode.workspace.applyEdit(edit)
		} else {
			vscode.window.showInformationMessage('File format not supported!')
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
