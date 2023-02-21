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
	async updateNestedComments() {
		let editor = vscode.window.activeTextEditor
		if (!editor) return
		const doc = editor.document
		const supported = [
			'asp',
			'cfm',
			'css',
			'htm',
			'html',
			'javascript',
			'javascriptreact',
			'typescript',
			'typescriptreact',
			'md',
			'njk',
			'php',
			'blade',
			'twig',
			'svelte',
			'svg',
			'tpl',
			'vue',
			'xml',
			'xsl',
			'xslt'
		]

		if (supported.indexOf(doc.languageId) === -1) {
			vscode.window.showInformationMessage(`${doc.languageId} file format not supported!`)
			return
		} else {
			const selection = editor.selection
			const allText = editor.document.getText()
			const selText = editor.document.getText(selection)
			let language = doc.languageId
			let modText = ''
			if (language === 'svelte' || language === 'vue') language = wrappingRootTag(allText, selText)
			switch (language) {
				case 'javascript':
				case 'typescript':
				case 'css':
					modText = toggleComment(selText, '/*', '*/', '/~', '~/')
					break
				case 'javascriptreact':
				case 'typescriptreact':
					modText = toggleComment(selText, '{/*', '*/}', '/~', '~/')
					break
				case 'tpl':
				case 'twig':
					modText = toggleComment(selText, '{#', '#}', '{~#', '#~}')
					break
				case 'blade':
					modText = toggleComment(selText, '{{--', ' --}}', '{{~~', '~~}}')
					break
				case 'html':
				default:
					modText = toggleComment(selText, '<!--', ' -->', '<!~~', '~~>')
					break
			}
			let edit = new vscode.WorkspaceEdit()
			let startPos = new vscode.Position(selection.start.line, selection.start.character)
			const endPos = new vscode.Position(
				selection.start.line + selText.split(/\r\n|\r|\n/).length - 1,
				selection.start.character + selText.length
			)
			const range = new vscode.Range(startPos, endPos)
			edit.replace(editor.document.uri, range, modText)
			await vscode.workspace.applyEdit(edit)
			let delta = modText.length - selText.length
			editor.selections = [new vscode.Selection(startPos, endPos.translate(0, delta))]
			return
		}
	}
}

function wrappingRootTag(text, selection) {
	let tag = [...text.matchAll(/<(\w+).*?>(.*)<\/\1>/gms)].find(tag => tag[2].includes(selection))
	if (tag) tag = tag[1]
	if (tag === 'script') return 'javascript'
	else if (tag === 'style') return 'css'
	else return 'html'
}

function toggleComment(text, prefix, suffix, nestedPrefix, nestedSuffix) {
	if (text.trimStart().startsWith(prefix)) {
		text = text.replaceAll(prefix, '')
		text = text.replaceAll(suffix, '')
		text = text.replaceAll(nestedPrefix, prefix)
		text = text.replaceAll(nestedSuffix, suffix)
	} else {
		text = text.replaceAll(prefix, nestedPrefix)
		text = text.replaceAll(suffix, nestedSuffix)
		text = `${prefix}${text}${suffix}`
	}
	return text
}

// this method is called when your extension is deactivated
export function deactivate() {}
