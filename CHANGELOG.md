# Change Log

All notable changes to the "html-nested-comments" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [4.0.1] 🩹 Update Markdown support

## [4.0.0] 🔖 Version 4.0

### 🎉 The [Scott Rhamy](https://github.com/cycle4passion) update!

A big thank you to [Scott Rhamy](https://github.com/cycle4passion) for this major update that finally brings support to Svelte/Vue.

- Add support for `*.js` and `*.ts` files
- Add support for multiple cursor selections
- Add Svelte/Vue support
- Fix Selection after commenting to include the initial block comment indicator.
- Fix Selection starting with a block comment indicator and having an ending block comment indicator in middle with additional text selected. It would uncomment rather than comment.
- Fix Selection ending on line with additional unselected content. This would cause additional unselected content to be deleted on nesting or unnesting.

## [3.0.3] 💄 Update Icon Transparency

## [3.0.2] 🔧 Add Publisher

## [3.0.1] 🔧 Update Test Scripts

## [3.0.0] 🔖 Version 3.0 With Svelte Support

- Add support for Svelte components
- Upgrade to match version 1.64
- Update screenshots
- Update icon

## 2021-10-28

- 🔧 Add `.tpl` Extension Support

## 2019-05-28

- 🐛 Fix HTML Nesting Bug

Revert Laverdet update. Separate branch with Laverdet code pushed as a debug source.

## 2019-02-17

- 🚀 Laverdet Update

Special thanks to [laverdet](https://github.com/laverdet) for a major update, which includes:

- support for additional languages (full list of supported languages is available in the README file)
- flexible selections: selections don't need to be exact, so if you want to uncomment a block and your selection is off by just whitespace you can still activate the command
- partial uncommenting: if you make a selection within a larger comment block and activate the command you can uncomment just a subset of the larger block

## 2018-11-21

- 💄 Update Icon

## 2018-11-19

- ⬆️ Fix Dependency Vulnerabilities
- ✨ Add Typescript React Language Support

## 2018-11-18

- ✨ Add Twig Support

## 2018-11-16

- ✨ Add JSX Support

## 2018-07-27

- 💡 Update Documentation

## [2.1.4] 🐛 Fix CSS Spacing Bug

## [2.1.3] 🖼️ Update Icon

## [2.1.2] 🎨 Remove Extra Space In CSS Comments

## [2.1.1] 📚 Update README

## [2.1.0] ✨ Add `XSL` File Support

## [2.0.2] 📚 Update `multi-root ready` Status

## [2.0.1] 📚 Update `package.json` Keywords/Categories

## [2.0.0] 🔧 Add CSS Syntax Support

## [1.1.2] 🔧 Fix Keybinding

- Adjust default keybinding so the package does not hijack the default commenting key binding for Windows users.

## [1.1.1]

- Update Trigger 'When' Case

Keybinding trigger only happens when a the editor has an active selection.

## [1.1.0]

- Update Icon Image

## [1.0.0]

- Initial release
