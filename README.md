![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/philsinatra.nested-comments.svg?style=flat-square)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/d/philsinatra.nested-comments.svg?style=flat-square)]()
[![license](https://img.shields.io/github/license/philsinatra/NestedCommentsVSCode.svg?style=flat-square)](https://github.com/philsinatra/NestedCommentsVSCode/blob/master/LICENSE)

# Nest Comments

## 🎉 Version 2 🎉

The package has been renamed to _Nest Comments_, and now supports both the HTML syntax of commenting `<!-- -->` and the CSS syntax `/* */`.

## About

**The problem**: if your code contains a comment, and you want to add a new comment to temporarily disable a block or portion of code, the built in commenting functionality does not actually place the comment tags in expected locations. If an existing comment is included in the content being commented out, the first instance of a `-->` or `*/` closing comment tag will end the entire comment.

**The solution**: The extension very simply finds all comments within the highlighted block of code and converts dashes to tildes, and then places the comment tags in the expected locations. It also then reverses the effect to un-comment the same code.

## Features

If you need to comment out a portion of your code that includes pre-existing comments, the native commenting functionality will not comment properly or preserve your existing comments. This extension will maintain your original comments and allow you to quickly toggle comments on sections of code.

![code before nesting](images/demo.gif)

### HTML Sample

```html
<main role="main">
<!-- A comment that's very important -->
	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
</main>
```

Becomes:

```html
<!-- <main role="main">
<!~~ A comment that's very important ~~>
	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
</main> -->
```

### CSS Sample

```css
body {
	/* margin: 0; */
}
```

Becomes:

```css
/* body {
	/~ margin: 0; ~/
} */
```

## Extension Settings

The following file formats are supported:

- asp
- cfm
- css
- htm
- html
- md
- njk
- php
- svg
- vue
- xml

## Known Issues

None at this time 😃

## Release Notes

Full release notes are available in the CHANGELOG file.