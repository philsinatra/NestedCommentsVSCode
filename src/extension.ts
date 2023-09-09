import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "Nested Comments" is now active!')
	let nestComments = new NestComments()

	let disposable = vscode.commands.registerCommand('extension.nestComments', () => {
		nestComments.updateNestedComments()
	})

	context.subscriptions.push(disposable)
}

function wrappingRootTag(text, selection) {
	let tag = [...text.matchAll(/<(\w+).*?>(.*)<\/\1>/gms)].find(tag => tag[2].includes(selection))
	if (tag) tag = tag[1]
	if (tag === 'script') return 'javascript'
	else if (tag === 'style') return 'css'
	else return 'html'
}

function toggleComment(
	text: string,
	prefix: string,
	suffix: string,
	nestedPrefix: string,
	nestedSuffix: string
) {
	if (text.trimStart().startsWith(prefix) && text.trimEnd().endsWith(suffix)) {
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

class NestComments {
	public updateNestedComments() {
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
			'markdown',
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

		let customLanguages = vscode.workspace.getConfiguration('nested-comments').customLanguages;

		if (supported.indexOf(doc.languageId) === -1 && !(doc.languageId in customLanguages)) {
			vscode.window.showInformationMessage(`${doc.languageId} file format not supported!`)
			return
		} else {
			return editor.edit(editBuilder => {
				editor.selections.map(selection => {
					const all_text = editor.document.getText()
					const selected_text = editor.document.getText(selection)
					let language = doc.languageId
					let modified_text = ''

					if (doc.languageId in customLanguages) {
						let settings = customLanguages[doc.languageId];

						if (!('normal' in settings)) {
							vscode.window.showErrorMessage(`${doc.languageId}.normal does not exist!`)
							return false;
						}
						let normal = settings['normal'];
						if (!Array.isArray(normal)) {
							vscode.window.showErrorMessage(`${doc.languageId}.normal is not an array!`)
							return false;
						}
						if (normal.length !== 2) {
							vscode.window.showErrorMessage(`${doc.languageId}.normal must have two elements!`)
							return false;
						}

						if (!('nested' in settings)) {
							vscode.window.showErrorMessage(`${doc.languageId}.nested does not exist!`)
							return false;
						}
						let nested = settings['nested'];
						if (!Array.isArray(nested)) {
							vscode.window.showErrorMessage(`${doc.languageId}.nested is not an array!`)
							return false;
						}
						if (nested.length !== 2) {
							vscode.window.showErrorMessage(`${doc.languageId}.nested must have two elements!`)
							return false;
						}

						modified_text = toggleComment(selected_text, normal[0], normal[1], nested[0], nested[1]);

						editBuilder.replace(selection, modified_text);

						return;
					}

					if (language === 'svelte' || language === 'vue')
						language = wrappingRootTag(all_text, selected_text)

					switch (language) {
						case 'markdown':
							if (selected_text.includes('<!'))
								modified_text = toggleComment(selected_text, '<!--', '-->', '<!~~', '~~>')
							else if (selected_text.includes('/*'))
								modified_text = toggleComment(selected_text, '/*', '*/', '/~', '~/')
							else return false
							break
						case 'javascript':
						case 'typescript':
						case 'css':
							modified_text = toggleComment(selected_text, '/*', '*/', '/~', '~/')
							break
						case 'javascriptreact':
						case 'typescriptreact':
							modified_text = toggleComment(selected_text, '{/*', '*/}', '/~', '~/')
							break
						case 'tpl':
						case 'twig':
							modified_text = toggleComment(selected_text, '{#', '#}', '{~#', '#~}')
							break
						case 'blade':
							modified_text = toggleComment(selected_text, '{{--', '--}}', '{{~~', '~~}}')
							break
						case 'html':
						default:
							modified_text = toggleComment(selected_text, '<!--', '-->', '<!~~', '~~>')
							break
					}

					editBuilder.replace(selection, modified_text)
				})
			})
		}
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
