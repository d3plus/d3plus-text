# d3plus-text

[![NPM Release](http://img.shields.io/npm/v/d3plus-text.svg?style=flat)](https://www.npmjs.org/package/d3plus-text) [![Build Status](https://travis-ci.org/d3plus/d3plus-text.svg?branch=master)](https://travis-ci.org/d3plus/d3plus-text) [![Dependency Status](http://img.shields.io/david/d3plus/d3plus-text.svg?style=flat)](https://david-dm.org/d3plus/d3plus-text) [![Gitter](https://img.shields.io/badge/-chat_on_gitter-brightgreen.svg?style=flat&logo=gitter-white)](https://gitter.im/d3plus/) [![1.0 progress](https://img.shields.io/badge/1.0_progress-67%25-yellow.svg?style=flat)](https://github.com/d3plus/d3plus-text/projects/2)

A smart SVG text box with line wrapping and automatic font size scaling.

## Installing

If you use NPM, run `npm install d3plus-text --save`. Otherwise, download the [latest release](https://github.com/d3plus/d3plus-text/releases/latest). The released bundle supports AMD, CommonJS, and vanilla environments. You can also load directly from [d3plus.org](https://d3plus.org):

```html
<script src="https://d3plus.org/js/d3plus-text.v0.9.full.min.js"></script>
```

[width]: 700
[height]: 75

## Wrapping SVG Text

Without a doubt, the most commonly requested part of the [d3plus-text](https://github.com/d3plus/d3plus-text) module is [textBox](http://d3plus.org/docs/#TextBox), which is used for intelligently wrapping SVG text. At it's core, it accepts an array of data points containing `"text"` keys and adds them to the page using a set of defaults. Here is a data array containing 3 different sentences to be wrapped:

```js
var data = [
  {text: "Here is some sample text that has been wrapped using d3plus.textBox."},
  {text: "...and here is a second sentence!"},
  {text: "这是句3号。这也即使包装没有空格！"}
];
```

And finally, this is how that data array would be passed to the [textBox](http://d3plus.org/docs/#TextBox):

```js
new d3plus.TextBox()
  .data(data)
  .fontSize(16)
  .width(200)
  .x(function(d, i) { return i * 250; })
  .render();
```

While [textBox](http://d3plus.org/docs/#TextBox) comes with some helpful defaults, this example shows how any of the methods can be overridden with static values or accessor functions. For more information on how the [textSplit](http://d3plus.org/docs/#textSplit) function splits strings, specifically in languages that don't use spaces, check out [this blog post](https://blog.datawheel.us/english-is-not-chinese-69b43959bb47).


[<kbd><img src="/example/getting-started.png" width="700px" /></kbd>](https://d3plus.org/examples/d3plus-text/getting-started/)

[Click here](https://d3plus.org/examples/d3plus-text/getting-started/) to view this example live on the web.


### More Examples

 * [Resizing Text to Fill Container](http://d3plus.org/examples/d3plus-text/resizing-text/)

## API Reference

##### 
* [TextBox](#TextBox)

##### 
* [fontExists](#fontExists) - Given either a single font-family or a list of fonts, returns the name of the first font that can be rendered, or `false` if none are installed on the user's machine.
* [rtl](#rtl) - Returns `true` if the HTML or body element has either the "dir" HTML attribute or the "direction" CSS property set to "rtl".
* [stringify](#stringify) - Coerces value into a String.
* [strip](#strip) - Removes all non ASCII characters from a string.
* [textSplit](#textSplit) - Splits a given sentence into an array of words.
* [textWidth](#textWidth) - Given a text string, returns the predicted pixel width of the string when placed into DOM.
* [textWrap](#textWrap) - Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.
* [titleCase](#titleCase) - Capitalizes the first letter of each word in a phrase/sentence.
* [trim](#trim) - Cross-browser implementation of [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim).
* [trimLeft](#trimLeft) - Cross-browser implementation of [trimLeft](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimLeft).
* [trimRight](#trimRight) - Cross-browser implementation of [trimRight](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimRight).

---

<a name="TextBox"></a>
#### **TextBox** [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L20)


This is a global class, and extends all of the methods and functionality of [<code>BaseClass</code>](https://github.com/d3plus/d3plus-common#BaseClass).


* [TextBox](#TextBox) ⇐ [<code>BaseClass</code>](https://github.com/d3plus/d3plus-common#BaseClass)
    * [new TextBox()](#new_TextBox_new)
    * [.render([*callback*])](#TextBox.render)
    * [.ariaHidden(*value*)](#TextBox.ariaHidden) ↩︎
    * [.data([*data*])](#TextBox.data) ↩︎
    * [.delay([*value*])](#TextBox.delay) ↩︎
    * [.duration([*value*])](#TextBox.duration) ↩︎
    * [.ellipsis([*value*])](#TextBox.ellipsis) ↩︎
    * [.fontColor([*value*])](#TextBox.fontColor) ↩︎
    * [.fontFamily([*value*])](#TextBox.fontFamily) ↩︎
    * [.fontMax([*value*])](#TextBox.fontMax) ↩︎
    * [.fontMin([*value*])](#TextBox.fontMin) ↩︎
    * [.fontOpacity([*value*])](#TextBox.fontOpacity) ↩︎
    * [.fontResize([*value*])](#TextBox.fontResize) ↩︎
    * [.fontSize([*value*])](#TextBox.fontSize) ↩︎
    * [.fontWeight([*value*])](#TextBox.fontWeight) ↩︎
    * [.height([*value*])](#TextBox.height) ↩︎
    * [.id([*value*])](#TextBox.id) ↩︎
    * [.lineHeight([*value*])](#TextBox.lineHeight) ↩︎
    * [.maxLines([*value*])](#TextBox.maxLines) ↩︎
    * [.overflow([*value*])](#TextBox.overflow) ↩︎
    * [.padding([*value*])](#TextBox.padding) ↩︎
    * [.pointerEvents([*value*])](#TextBox.pointerEvents) ↩︎
    * [.rotate([*value*])](#TextBox.rotate) ↩︎
    * [.rotateAnchor(_)](#TextBox.rotateAnchor) ↩︎
    * [.select([*selector*])](#TextBox.select) ↩︎
    * [.split([*value*])](#TextBox.split) ↩︎
    * [.text([*value*])](#TextBox.text) ↩︎
    * [.textAnchor([*value*])](#TextBox.textAnchor) ↩︎
    * [.verticalAlign([*value*])](#TextBox.verticalAlign) ↩︎
    * [.width([*value*])](#TextBox.width) ↩︎
    * [.x([*value*])](#TextBox.x) ↩︎
    * [.y([*value*])](#TextBox.y) ↩︎


<a name="new_TextBox_new" href="#new_TextBox_new">#</a> new **TextBox**()

Creates a wrapped text box for each point in an array of data. See [this example](https://d3plus.org/examples/d3plus-text/getting-started/) for help getting started using the TextBox class.





<a name="TextBox.render" href="#TextBox.render">#</a> TextBox.**render**([*callback*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L73)

Renders the text boxes. If a *callback* is specified, it will be called once the shapes are done drawing.


This is a static method of [<code>TextBox</code>](#TextBox).


<a name="TextBox.ariaHidden" href="#TextBox.ariaHidden">#</a> TextBox.**ariaHidden**(*value*) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L340)

If *value* is specified, sets the aria-hidden attribute to the specified function or string and returns the current class instance.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.data" href="#TextBox.data">#</a> TextBox.**data**([*data*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L352)

Sets the data array to the specified array. A text box will be drawn for each object in the array.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.delay" href="#TextBox.delay">#</a> TextBox.**delay**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L362)

Sets the animation delay to the specified number in milliseconds.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.duration" href="#TextBox.duration">#</a> TextBox.**duration**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L372)

Sets the animation duration to the specified number in milliseconds.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.ellipsis" href="#TextBox.ellipsis">#</a> TextBox.**ellipsis**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L386)

Sets the function that handles what to do when a line is truncated. It should return the new value for the line, and is passed 2 arguments: the String of text for the line in question, and the number of the line. By default, an ellipsis is added to the end of any line except if it is the first word that cannot fit (in that case, an empty string is returned).


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(text, line) {
  return line ? text.replace(/\.|,$/g, "") + "..." : "";
}
```


<a name="TextBox.fontColor" href="#TextBox.fontColor">#</a> TextBox.**fontColor**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L396)

Sets the font color to the specified accessor function or static string, which is inferred from the [DOM selection](#textBox.select) by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontFamily" href="#TextBox.fontFamily">#</a> TextBox.**fontFamily**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L406)

Defines the font-family to be used. The value passed can be either a *String* name of a font, a comma-separated list of font-family fallbacks, an *Array* of fallbacks, or a *Function* that returns either a *String* or an *Array*. If supplying multiple fallback fonts, the [fontExists](#fontExists) function will be used to determine the first available font on the client's machine.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontMax" href="#TextBox.fontMax">#</a> TextBox.**fontMax**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L416)

Sets the maximum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when [dynamically resizing fonts](#textBox.fontResize).


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontMin" href="#TextBox.fontMin">#</a> TextBox.**fontMin**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L426)

Sets the minimum font size to the specified accessor function or static number (which corresponds to pixel units), which is used when [dynamically resizing fonts](#textBox.fontResize).


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontOpacity" href="#TextBox.fontOpacity">#</a> TextBox.**fontOpacity**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L436)

Sets the font opacity to the specified accessor function or static number between 0 and 1.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontResize" href="#TextBox.fontResize">#</a> TextBox.**fontResize**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L446)

Toggles font resizing, which can either be defined as a static boolean for all data points, or an accessor function that returns a boolean. See [this example](http://d3plus.org/examples/d3plus-text/resizing-text/) for a side-by-side comparison.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontSize" href="#TextBox.fontSize">#</a> TextBox.**fontSize**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L456)

Sets the font size to the specified accessor function or static number (which corresponds to pixel units), which is inferred from the [DOM selection](#textBox.select) by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.fontWeight" href="#TextBox.fontWeight">#</a> TextBox.**fontWeight**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L466)

Sets the font weight to the specified accessor function or static number, which is inferred from the [DOM selection](#textBox.select) by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.height" href="#TextBox.height">#</a> TextBox.**height**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L480)

Sets the height for each box to the specified accessor function or static number.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d) {
  return d.height || 200;
}
```


<a name="TextBox.id" href="#TextBox.id">#</a> TextBox.**id**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L494)

Defines the unique id for each box to the specified accessor function or static number.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d, i) {
  return d.id || i + "";
}
```


<a name="TextBox.lineHeight" href="#TextBox.lineHeight">#</a> TextBox.**lineHeight**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L504)

Sets the line height to the specified accessor function or static number, which is 1.2 times the [font size](#textBox.fontSize) by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.maxLines" href="#TextBox.maxLines">#</a> TextBox.**maxLines**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L514)

Restricts the maximum number of lines to wrap onto, which is null (unlimited) by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.overflow" href="#TextBox.overflow">#</a> TextBox.**overflow**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L524)

Sets the text overflow to the specified accessor function or static boolean.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.padding" href="#TextBox.padding">#</a> TextBox.**padding**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L534)

Sets the padding to the specified accessor function, CSS shorthand string, or static number, which is 0 by default.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.pointerEvents" href="#TextBox.pointerEvents">#</a> TextBox.**pointerEvents**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L544)

Sets the pointer-events to the specified accessor function or static string.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.rotate" href="#TextBox.rotate">#</a> TextBox.**rotate**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L554)

Sets the rotate percentage for each box to the specified accessor function or static string.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.rotateAnchor" href="#TextBox.rotateAnchor">#</a> TextBox.**rotateAnchor**(_) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L564)

Sets the anchor point around which to rotate the text box.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.select" href="#TextBox.select">#</a> TextBox.**select**([*selector*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L574)

Sets the SVG container element to the specified d3 selector or DOM element. If not explicitly specified, an SVG element will be added to the page for use.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.split" href="#TextBox.split">#</a> TextBox.**split**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L584)

Sets the word split behavior to the specified function, which when passed a string is expected to return that string split into an array of words.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.text" href="#TextBox.text">#</a> TextBox.**text**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L598)

Sets the text for each box to the specified accessor function or static string.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d) {
  return d.text;
}
```


<a name="TextBox.textAnchor" href="#TextBox.textAnchor">#</a> TextBox.**textAnchor**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L608)

Sets the horizontal text anchor to the specified accessor function or static string, whose values are analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.verticalAlign" href="#TextBox.verticalAlign">#</a> TextBox.**verticalAlign**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L618)

Sets the vertical alignment to the specified accessor function or static string. Accepts `"top"`, `"middle"`, and `"bottom"`.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.


<a name="TextBox.width" href="#TextBox.width">#</a> TextBox.**width**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L632)

Sets the width for each box to the specified accessor function or static number.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d) {
  return d.width || 200;
}
```


<a name="TextBox.x" href="#TextBox.x">#</a> TextBox.**x**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L646)

Sets the x position for each box to the specified accessor function or static number. The number given should correspond to the left side of the textBox.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d) {
  return d.x || 0;
}
```


<a name="TextBox.y" href="#TextBox.y">#</a> TextBox.**y**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/TextBox.js#L660)

Sets the y position for each box to the specified accessor function or static number. The number given should correspond to the top side of the textBox.


This is a static method of [<code>TextBox</code>](#TextBox), and is chainable with other methods of this Class.
default accessor

```js
function(d) {
  return d.y || 0;
}
```

---

<a name="fontExists"></a>
#### d3plus.**fontExists**(font) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/fontExists.js#L10)

Given either a single font-family or a list of fonts, returns the name of the first font that can be rendered, or `false` if none are installed on the user's machine.


This is a global function.

---

<a name="rtl"></a>
#### d3plus.**rtl**() [<>](https://github.com/d3plus/d3plus-text/blob/master/src/rtl.js#L3)

Returns `true` if the HTML or body element has either the "dir" HTML attribute or the "direction" CSS property set to "rtl".


This is a global function.

---

<a name="stringify"></a>
#### d3plus.**stringify**(value) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/stringify.js#L1)

Coerces value into a String.


This is a global function.

---

<a name="strip"></a>
#### d3plus.**strip**(value) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/strip.js#L18)

Removes all non ASCII characters from a string.


This is a global function.

---

<a name="textSplit"></a>
#### d3plus.**textSplit**(sentence) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textSplit.js#L49)

Splits a given sentence into an array of words.


This is a global function.

---

<a name="textWidth"></a>
#### d3plus.**textWidth**(text, [style]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWidth.js#L1)

Given a text string, returns the predicted pixel width of the string when placed into DOM.


This is a global function.

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> \| <code>Array</code> | Can be either a single string or an array of strings to analyze. |
| [style] | <code>Object</code> | An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values. |


---

<a name="textWrap"></a>
#### d3plus.**textWrap**() [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L6)

Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.


This is a global function.


* [textWrap()](#textWrap)
    * [.fontFamily([*value*])](#textWrap.fontFamily)
    * [.fontSize([*value*])](#textWrap.fontSize)
    * [.fontWeight([*value*])](#textWrap.fontWeight)
    * [.height([*value*])](#textWrap.height)
    * [.lineHeight([*value*])](#textWrap.lineHeight)
    * [.maxLines([*value*])](#textWrap.maxLines)
    * [.overflow([*value*])](#textWrap.overflow)
    * [.split([*value*])](#textWrap.split)
    * [.width([*value*])](#textWrap.width)


<a name="textWrap.fontFamily" href="#textWrap.fontFamily">#</a> d3plus..**fontFamily**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L89)

If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.fontSize" href="#textWrap.fontSize">#</a> d3plus..**fontSize**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L98)

If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.fontWeight" href="#textWrap.fontWeight">#</a> d3plus..**fontWeight**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L107)

If *value* is specified, sets the font weight accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font weight.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.height" href="#textWrap.height">#</a> d3plus..**height**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L116)

If *value* is specified, sets height limit to the specified value and returns this generator. If *value* is not specified, returns the current value.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.lineHeight" href="#textWrap.lineHeight">#</a> d3plus..**lineHeight**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L125)

If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textWrap.fontSize) by default.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.maxLines" href="#textWrap.maxLines">#</a> d3plus..**maxLines**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L134)

If *value* is specified, sets the maximum number of lines allowed when wrapping.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.overflow" href="#textWrap.overflow">#</a> d3plus..**overflow**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L143)

If *value* is specified, sets the overflow to the specified boolean and returns this generator. If *value* is not specified, returns the current overflow value.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.split" href="#textWrap.split">#</a> d3plus..**split**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L152)

If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.


This is a static method of [<code>textWrap</code>](#textWrap).


<a name="textWrap.width" href="#textWrap.width">#</a> d3plus..**width**([*value*]) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/textWrap.js#L161)

If *value* is specified, sets width limit to the specified value and returns this generator. If *value* is not specified, returns the current value.


This is a static method of [<code>textWrap</code>](#textWrap).

---

<a name="titleCase"></a>
#### d3plus.**titleCase**(str) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/titleCase.js#L6)

Capitalizes the first letter of each word in a phrase/sentence.


This is a global function.

---

<a name="trim"></a>
#### d3plus.**trim**(str) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/trim.js#L1)

Cross-browser implementation of [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim).


This is a global function.

---

<a name="trimLeft"></a>
#### d3plus.**trimLeft**(str) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/trim.js#L10)

Cross-browser implementation of [trimLeft](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimLeft).


This is a global function.

---

<a name="trimRight"></a>
#### d3plus.**trimRight**(str) [<>](https://github.com/d3plus/d3plus-text/blob/master/src/trim.js#L19)

Cross-browser implementation of [trimRight](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/TrimRight).


This is a global function.

---



###### <sub>Documentation generated on Tue, 21 Aug 2018 18:56:31 GMT</sub>
