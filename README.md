# d3plus-text

[![NPM Release](http://img.shields.io/npm/v/d3plus-text.svg?style=flat-square)](https://www.npmjs.org/package/d3plus-text)
[![Build Status](https://travis-ci.org/d3plus/d3plus-text.svg?branch=master)](https://travis-ci.org/d3plus/d3plus-text)
[![Dependency Status](http://img.shields.io/david/d3plus/d3plus-text.svg?style=flat-square)](https://david-dm.org/d3plus/d3plus-text)
[![Dependency Status](http://img.shields.io/david/dev/d3plus/d3plus-text.svg?style=flat-square)](https://david-dm.org/d3plus/d3plus-text#info=devDependencies)

A javascript library that contains various text functions, most notably SVG text wrapping with automatic font size scaling.

## Installation Options

* [NPM](#install.npm)
* [Browser](#install.browser)
* [AMD and CommonJS](#install.amd)
* [Custom Builds](#install.custom)

<a name="install.npm"></a>
### NPM
```sh
npm install d3plus-text
```

<a name="install.browser"></a>
### Browser
In a vanilla environment, a `d3plus_text` global is exported. To use a compiled version hosted on [d3plus.org](https://d3plus.org) that includes all dependencies:

```html
<script src="https://d3plus.org/js/d3plus-text.v0.5.full.min.js"></script>
```

For development purposes, you can also load all dependencies separately:

```html
<script src="https://d3js.org/d3-array.v0.7.min.js"></script>
<script src="https://d3js.org/d3-color.v0.4.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v0.4.min.js"></script>
<script src="https://d3js.org/d3-ease.v0.7.min.js"></script>
<script src="https://d3js.org/d3-interpolate.v0.7.min.js"></script>
<script src="https://d3js.org/d3-selection.v0.7.min.js"></script>
<script src="https://d3js.org/d3-timer.v0.4.min.js"></script>
<script src="https://d3js.org/d3-transition.v0.2.min.js"></script>
<script src="https://d3plus.org/js/d3plus-text.v0.5.min.js"></script>
```

Otherwise, [click here](https://github.com/d3plus/d3plus-text/releases/latest) to download the latest release.

<a name="install.amd"></a>
### AMD and CommonJS
The released bundle natively supports both AMD and CommonJS, and vanilla environments.

<a name="install.custom"></a>
### Custom Builds
The source code is written using standard `import` and `export` statements. Create a custom build using [Rollup](https://github.com/rollup/rollup) or your preferred bundler. Take a look at the [index.js](https://github.com/d3plus/d3plus-text/blob/master/index.js) file to see the modules exported.

---

# API Reference
## Functions

<dl>
<dt><a href="#box">box([data])</a></dt>
<dd><p>Creates a wrapped text box based on an array of data. If <em>data</em> is specified, immediately wraps the text based on the specified array and returns this generator. If <em>data</em> is not specified on instantiation, it can be passed/updated after instantiation using the <a href="#box.data">data</a> method.</p>
</dd>
<dt><a href="#width">width(sentence)</a></dt>
<dd><p>Splits a given sentence into an array of words.</p>
</dd>
<dt><a href="#stringify">stringify(value)</a></dt>
<dd><p>Coerces value into a String.</p>
</dd>
<dt><a href="#width">width(text, [style])</a></dt>
<dd><p>Given a text string, returns the predicted pixel width of the string when placed into DOM.</p>
</dd>
<dt><a href="#wrap">wrap()</a></dt>
<dd><p>Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.</p>
</dd>
</dl>

<a name="box"></a>

## box([data])
Creates a wrapped text box based on an array of data. If *data* is specified, immediately wraps the text based on the specified array and returns this generator. If *data* is not specified on instantiation, it can be passed/updated after instantiation using the [data](#box.data) method.

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| [data] | <code>Array</code> | <code>[]</code> | 

**Example** *(a sample row of data)*  
```js
var data = {"text": "Hello D3plus, please wrap this sentence for me."};
```
**Example** *(passed to the generator)*  
```js
box([data]);
```
**Example** *(creates the following)*  
```js
<text class="d3plus-text-box" id="d3plus-text-box-0" text-anchor="start" font-family="Helvetica Neue" font-size="16px" transform="translate(0,-3.6)">
  <tspan dominant-baseline="alphabetic" opacity="1" x="0px" dx="0px" dy="18px" style="baseline-shift: 0%;">
    Hello D3plus, please wrap
  </tspan>
  <tspan dominant-baseline="alphabetic" opacity="1" x="0px" dx="0px" dy="18px" style="baseline-shift: 0%;">
    this sentence for me.
  </tspan>
</text>
```
**Example** *(this is shorthand for the following)*  
```js
box().data([data])();
```
**Example** *(which also allows a post-draw callback function)*  
```js
box().data([data])(function() { alert("draw complete!"); })
```

* [box([data])](#box)
    * [.data([*data*])](#box.data)
    * [.delay([*value*])](#box.delay)
    * [.duration([*value*])](#box.duration)
    * [.ellipsis([*value*])](#box.ellipsis)
    * [.fontColor([*value*])](#box.fontColor)
    * [.fontFamily([*value*])](#box.fontFamily)
    * [.fontMax([*value*])](#box.fontMax)
    * [.fontMin([*value*])](#box.fontMin)
    * [.fontResize([*value*])](#box.fontResize)
    * [.fontSize([*value*])](#box.fontSize)
    * [.height([*value*])](#box.height)
    * [.id([*value*])](#box.id)
    * [.lineHeight([*value*])](#box.lineHeight)
    * [.overflow([*value*])](#box.overflow)
    * [.select([*selector*])](#box.select)
    * [.split([*value*])](#box.split)
    * [.text([*value*])](#box.text)
    * [.textAnchor([*value*])](#box.textAnchor)
    * [.verticalAlign([*value*])](#box.verticalAlign)
    * [.width([*value*])](#box.width)
    * [.x([*value*])](#box.x)
    * [.y([*value*])](#box.y)

<a name="box.data"></a>

### box.data([*data*])
If *data* is specified, sets the data array to the specified array and returns this generator. If *data* is not specified, returns the current data array. A text box will be drawn for each object in the array.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*data*] | <code>Array</code> | <code>[]</code> | 

<a name="box.delay"></a>

### box.delay([*value*])
If *value* is specified, sets the animation delay to the specified number and returns this generator. If *value* is not specified, returns the current animation delay.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>0</code> | 

<a name="box.duration"></a>

### box.duration([*value*])
If *value* is specified, sets the animation duration to the specified number and returns this generator. If *value* is not specified, returns the current animation duration.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>0</code> | 

<a name="box.ellipsis"></a>

### box.ellipsis([*value*])
If *value* is specified, sets the ellipsis method to the specified function or string and returns this generator. If *value* is not specified, returns the current ellipsis method, which simply adds an ellipsis to the string by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

**Example**  
```js
function(d) {
  return d + "...";
}
```
<a name="box.fontColor"></a>

### box.fontColor([*value*])
If *value* is specified, sets the font color accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font color accessor, which is inferred from the [container element](#box.select) by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="box.fontFamily"></a>

### box.fontFamily([*value*])
If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family accessor, which is inferred from the [container element](#box.select) by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="box.fontMax"></a>

### box.fontMax([*value*])
If *value* is specified, sets the maximum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current maximum font size accessor. The maximum font size is used when [resizing fonts](#box.fontResize) dynamically.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | <code>50</code> | 

<a name="box.fontMin"></a>

### box.fontMin([*value*])
If *value* is specified, sets the minimum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current minimum font size accessor. The minimum font size is used when [resizing fonts](#box.fontResize) dynamically.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | <code>8</code> | 

<a name="box.fontResize"></a>

### box.fontResize([*value*])
If *value* is specified, sets the font resizing accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current font resizing accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Boolean</code> | <code>false</code> | 

<a name="box.fontSize"></a>

### box.fontSize([*value*])
If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size accessor, which is inferred from the [container element](#box.select) by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="box.height"></a>

### box.height([*value*])
If *value* is specified, sets the height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current height accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example**  
```js
function(d) {
  return d.height || 200;
}
```
<a name="box.id"></a>

### box.id([*value*])
If *value* is specified, sets the id accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current id accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example**  
```js
function(d, i) {
  return d.id || i + "";
}
```
<a name="box.lineHeight"></a>

### box.lineHeight([*value*])
If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#box.fontSize) by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="box.overflow"></a>

### box.overflow([*value*])
If *value* is specified, sets the overflow accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current overflow accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Boolean</code> | <code>false</code> | 

<a name="box.select"></a>

### box.select([*selector*])
If *selector* is specified, sets the SVG container element to the specified d3 selector or DOM element and returns this generator. If *selector* is not specified, returns the current SVG container element, which adds an SVG element to the page by default.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*selector*] | <code>String</code> &#124; <code>HTMLElement</code> | 

<a name="box.split"></a>

### box.split([*value*])
If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [*value*] | <code>function</code> | A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&` |

<a name="box.text"></a>

### box.text([*value*])
If *value* is specified, sets the text accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current text accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

**Example**  
```js
function(d) {
  return d.text;
}
```
<a name="box.textAnchor"></a>

### box.textAnchor([*value*])
If *value* is specified, sets the horizontal text anchor accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current horizontal text anchor accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | <code>&quot;start&quot;</code> | Analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property. |

<a name="box.verticalAlign"></a>

### box.verticalAlign([*value*])
If *value* is specified, sets the vertical alignment accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current vertical alignment accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | <code>&quot;top&quot;</code> | Accepts `"top"`, `"middle"`, and `"bottom"`. |

<a name="box.width"></a>

### box.width([*value*])
If *value* is specified, sets the width accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current width accessor.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example**  
```js
function(d) {
  return d.width || 200;
}
```
<a name="box.x"></a>

### box.x([*value*])
If *value* is specified, sets the x accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current x accessor. The number returned should correspond to the left position of the box.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example**  
```js
function(d) {
  return d.x || 0;
}
```
<a name="box.y"></a>

### box.y([*value*])
If *value* is specified, sets the y accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current y accessor. The number returned should correspond to the top position of the box.

**Kind**: static method of <code>[box](#box)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example**  
```js
function(d) {
  return d.y || 0;
}
```
<a name="width"></a>

## width(sentence)
Splits a given sentence into an array of words.

**Kind**: global function  

| Param | Type |
| --- | --- |
| sentence | <code>String</code> | 

<a name="stringify"></a>

## stringify(value)
Coerces value into a String.

**Kind**: global function  

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="width"></a>

## width(text, [style])
Given a text string, returns the predicted pixel width of the string when placed into DOM.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> &#124; <code>Array</code> | Can be either a single string or an array of strings to analyze. |
| [style] | <code>Object</code> | An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values. |

<a name="wrap"></a>

## wrap()
Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.

**Kind**: global function  

* [wrap()](#wrap)
    * [.fontFamily([*value*])](#wrap.fontFamily)
    * [.fontSize([*value*])](#wrap.fontSize)
    * [.height([*value*])](#wrap.height)
    * [.lineHeight([*value*])](#wrap.lineHeight)
    * [.overflow([*value*])](#wrap.overflow)
    * [.split([*value*])](#wrap.split)
    * [.width([*value*])](#wrap.width)

<a name="wrap.fontFamily"></a>

### wrap.fontFamily([*value*])
If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="wrap.fontSize"></a>

### wrap.fontSize([*value*])
If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="wrap.height"></a>

### wrap.height([*value*])
If *value* is specified, sets height limit to the specified value and returns this generator. If *value* is not specified, returns the current value.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>200</code> | 

<a name="wrap.lineHeight"></a>

### wrap.lineHeight([*value*])
If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#wrap.fontSize) by default.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="wrap.overflow"></a>

### wrap.overflow([*value*])
If *value* is specified, sets the overflow to the specified boolean and returns this generator. If *value* is not specified, returns the current overflow value.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Boolean</code> | <code>false</code> | 

<a name="wrap.split"></a>

### wrap.split([*value*])
If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [*value*] | <code>function</code> | A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&` |

<a name="wrap.width"></a>

### wrap.width([*value*])
If *value* is specified, sets width limit to the specified value and returns this generator. If *value* is not specified, returns the current value.

**Kind**: static method of <code>[wrap](#wrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>200</code> | 

