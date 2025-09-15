import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "Nested Comments" is now active!')
	const nestComments = new NestComments()

	const disposable = vscode.commands.registerCommand('extension.nestComments', () => {
		nestComments.updateNestedComments()
	})

	context.subscriptions.push(disposable)
}

function wrappingRootTag(text: string, selection: string): string {
	// Check for Astro frontmatter first (JS/TS between --- delimiters)
	const fmRegex = /^---([\s\S]*?)---/
	const fmMatch = text.match(fmRegex)
	if (fmMatch?.[1]?.includes(selection)) return 'javascript'

	// Find the position of the selection in the text
	const selectionIndex = text.indexOf(selection)
	if (selectionIndex === -1) return 'html'

	// Look for script and style tags that contain the selection
	const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
	const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi

	// Check style tags first
	let match: RegExpExecArray | null = styleRegex.exec(text)
	while (match !== null) {
		const tagStart = match.index + match[0].indexOf('>') + 1
		const tagEnd = match.index + match[0].lastIndexOf('<')

		if (selectionIndex >= tagStart && selectionIndex < tagEnd) {
			return 'css'
		}
		match = styleRegex.exec(text)
	}

	// Check script tags
	match = scriptRegex.exec(text)
	while (match !== null) {
		const tagStart = match.index + match[0].indexOf('>') + 1
		const tagEnd = match.index + match[0].lastIndexOf('<')

		if (selectionIndex >= tagStart && selectionIndex < tagEnd) {
			return 'javascript'
		}
		match = scriptRegex.exec(text)
	}

	return 'html'
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
function getNotSupportCommand(): boolean {
  return vscode.workspace.getConfiguration('nestedComments').get('notSupportCommand') as boolean
}
class NestComments {
	public updateNestedComments() {
		const editor = vscode.window.activeTextEditor
		if (!editor) return
		const doc = editor.document
		const supported = [
			'asp',
			'astro',
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
		if (supported.indexOf(doc.languageId) === -1) {
			if(getNotSupportCommand())
				vscode.commands.executeCommand('editor.action.commentLine');
			else
				vscode.window.showInformationMessage(`${doc.languageId} file format not supported!`)
			return
		} else {
			return editor.edit(editBuilder => {
				editor.selections.forEach(selection => {
					const all_text = editor.document.getText()
					const selected_text = editor.document.getText(selection)
					let language = doc.languageId
					let modified_text = ''

					if (language === 'svelte' || language === 'vue' || language === 'astro')
						language = wrappingRootTag(all_text, selected_text)

					switch (language) {
						case 'markdown':
							if (selected_text.includes('<!'))
								modified_text = toggleComment(selected_text, '<!--', '-->', '<!~~', '~~>')
							else if (selected_text.includes('/*'))
								modified_text = toggleComment(selected_text, '/*', '*/', '/~', '~/')
							else return
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
export function deactivate() {
	console.log('NestedComments deactivated')
}
