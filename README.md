![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/philsinatra.nested-comments.svg?style=flat-square)
[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/d/philsinatra.nested-comments.svg?style=flat-square)]()
[![license](https://img.shields.io/github/license/philsinatra/NestedCommentsVSCode.svg?style=flat-square)](https://github.com/philsinatra/NestedCommentsVSCode/blob/master/LICENSE)

# Nest Comments

## About

If your code contains a comment, and you want to add a new comment to temporarily disable a block or portion of code, the built in commenting functionality does not actually place the comment tags in expected locations. If an existing comment is included in the content being commented out, the first instance of a `-->` or `*/` closing comment tag will end the entire comment.

This extension will convert pre-existing comments to safe characters, allowing a new block comment that includes the original comment. It also reverses the effect to uncomment the same block of code.

## Features

If you need to comment out a portion of your code that includes pre-existing comments, the native commenting functionality will not comment properly or preserve your existing comments. This extension will maintain your original comments and allow you to quickly toggle comments on sections of code.

## Examples

### HTML Syntax

![HTML example](images/nest_html.gif)

```html
<main>
  <div class="container">
    <h2>Hello World</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
    <!-- <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p> -->
  </div>
</main>
```

Becomes:

```html
<!-- <main>
  <div class="container">
    <h2>Hello World</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
    <!~~ <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p> ~~>
  </div>
</main> -->
```

### CSS Syntax

![CSS example](images/nest_css.gif)

```css
.example {
  /* display: flex; */
  transition: all 0.5s;
  /* user-select: none; */
  background: linear-gradient(to bottom, white, black);
}
```

Becomes:

```css
/*.example {
  /~ display: flex; ~/
  transition: all 0.5s;
  /~ user-select: none; ~/
  background: linear-gradient(to bottom, white, black);
}*/
```

## Usage

To trigger the extension, highlight the text that should be commented/uncommented.

### Default Keybindings

- Mac: <kbd>cmd</kbd> + <kbd>alt</kbd> + <kbd>/</kbd>
- Windows: <kbd>ctrl</kbd> + <kbd>alt</kbd> + <kbd>/</kbd>

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
- xsl

## Known Issues

None at this time 😃

## Release Notes

Full release notes are available in the CHANGELOG file.