# d3plus-text

[![NPM Release](http://img.shields.io/npm/v/d3plus-text.svg?style=flat-square)](https://www.npmjs.org/package/d3plus-text)
[![Build Status](https://travis-ci.org/d3plus/d3plus-text.svg?branch=master)](https://travis-ci.org/d3plus/d3plus-text)
[![Dependency Status](http://img.shields.io/david/d3plus/d3plus-text.svg?style=flat-square)](https://david-dm.org/d3plus/d3plus-text)

A smart SVG text box with line wrapping and automatic font size scaling.

## Installing

If you use NPM, `npm install d3plus-text`. Otherwise, download the [latest release](https://github.com/d3plus/d3plus-text/releases/latest). The released bundle supports AMD, CommonJS, and vanilla environments. Create a [custom bundle using Rollup](https://github.com/rollup/rollup) or your preferred bundler. You can also load directly from [d3plus.org](https://d3plus.org):

```html
<script src="https://d3plus.org/js/d3plus-text.v0.8.full.min.js"></script>
```


## Getting Started

Without a doubt, the most commonly used aspect of this module is [textBox](https://github.com/d3plus/d3plus-text#textBox), which is used for intelligently wrapping SVG text. At it's core, you can simply pass along data points with "text" values and the generator will add them to the page using a set of defaults. Here is a data array containing 3 different sentences to be wrapped:

```js
var data = [
  {text: "Here is some sample text that has been wrapped using d3plus.textBox."},
  {text: "...and here is a second sentence!"},
  {text: "这是句3号。这也即使包装没有空格！"}
];
```

And finally, this is how that data array would be passed to the [textBox](https://github.com/d3plus/d3plus-text#textBox) generator. Please note the `()` at the end of the chain of commands. This is what tells the [textBox](https://github.com/d3plus/d3plus-text#textBox) to finally render to the page, and allows setting multiple properties of the [textBox](https://github.com/d3plus/d3plus-text#textBox) without it trying to render after each one is set.

```js
d3plus.textBox()
  .data(data)
  .fontFamily("Verdana")
  .fontSize(16)
  .width(200)
  .x(function(d, i) { return i * 250; })
  ();
```

While [textBox](https://github.com/d3plus/d3plus-text#textBox) comes with some handy defaults, this example shows how any of the methods can be overridden with static values or accessor functions. For more information on how the [textSplit](#textSplit) function splits strings, specifically in languages that don't use spaces, check out [this blog post](https://blog.datawheel.us/english-is-not-chinese-69b43959bb47).


[Click here](https://d3plus.org/examples/d3plus-text/getting-started/) to view this example live on the web.

[![Getting Started](/example/getting-started.png)](https://d3plus.org/examples/d3plus-text/getting-started/)


### More Examples


 * [Automatic Font Resizing to Fit Container](http://d3plus.org/examples/d3plus-text/resizing-text/)


## API Reference
### Functions

<dl>
<dt><a href="#stringify">stringify(value)</a></dt>
<dd><p>Coerces value into a String.</p>
</dd>
<dt><a href="#textBox">textBox([data])</a></dt>
<dd><p>Creates a wrapped text box based on an array of data. If <em>data</em> is specified, immediately wraps the text based on the specified array and returns this generator. If <em>data</em> is not specified on instantiation, it can be passed/updated after instantiation using the <a href="#textBox.data">data</a> method. See <a href="https://d3plus.org/examples/d3plus-text/getting-started/">this example</a> for help getting started using the textBox function.</p>
</dd>
<dt><a href="#textSplit">textSplit(sentence)</a></dt>
<dd><p>Splits a given sentence into an array of words.</p>
</dd>
<dt><a href="#textWidth">textWidth(text, [style])</a></dt>
<dd><p>Given a text string, returns the predicted pixel width of the string when placed into DOM.</p>
</dd>
<dt><a href="#textWrap">textWrap()</a></dt>
<dd><p>Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.</p>
</dd>
</dl>

<a name="stringify"></a>

### stringify(value)
Coerces value into a String.

**Kind**: global function  

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="textBox"></a>

### textBox([data])
Creates a wrapped text box based on an array of data. If *data* is specified, immediately wraps the text based on the specified array and returns this generator. If *data* is not specified on instantiation, it can be passed/updated after instantiation using the [data](#textBox.data) method. See [this example](https://d3plus.org/examples/d3plus-text/getting-started/) for help getting started using the textBox function.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [data] | <code>Array</code> | <code>[]</code> | An array of text blocks to be wrapped. |


* [textBox([data])](#textBox)
    * [.config([*value*])](#textBox.config)
    * [.data([*data*])](#textBox.data)
    * [.delay([*value*])](#textBox.delay)
    * [.duration([*value*])](#textBox.duration)
    * [.ellipsis([*value*])](#textBox.ellipsis)
    * [.fontColor([*value*])](#textBox.fontColor)
    * [.fontFamily([*value*])](#textBox.fontFamily)
    * [.fontMax([*value*])](#textBox.fontMax)
    * [.fontMin([*value*])](#textBox.fontMin)
    * [.fontResize([*value*])](#textBox.fontResize)
    * [.fontSize([*value*])](#textBox.fontSize)
    * [.height([*value*])](#textBox.height)
    * [.id([*value*])](#textBox.id)
    * [.lineHeight([*value*])](#textBox.lineHeight)
    * [.on([*typenames*], [*listener*])](#textBox.on)
    * [.overflow([*value*])](#textBox.overflow)
    * [.select([*selector*])](#textBox.select)
    * [.split([*value*])](#textBox.split)
    * [.text([*value*])](#textBox.text)
    * [.textAnchor([*value*])](#textBox.textAnchor)
    * [.verticalAlign([*value*])](#textBox.verticalAlign)
    * [.width([*value*])](#textBox.width)
    * [.x([*value*])](#textBox.x)
    * [.y([*value*])](#textBox.y)

<a name="textBox.config"></a>

#### textBox.config([*value*])
If *value* is specified, sets the methods that correspond to the key/value pairs and returns this generator. If *value* is not specified, returns the current configuration.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>Object</code> | 

<a name="textBox.data"></a>

#### textBox.data([*data*])
If *data* is specified, sets the data array to the specified array and returns this generator. If *data* is not specified, returns the current data array. A text box will be drawn for each object in the array.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*data*] | <code>Array</code> | <code>[]</code> | 

<a name="textBox.delay"></a>

#### textBox.delay([*value*])
If *value* is specified, sets the animation delay to the specified number and returns this generator. If *value* is not specified, returns the current animation delay.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>0</code> | 

<a name="textBox.duration"></a>

#### textBox.duration([*value*])
If *value* is specified, sets the animation duration to the specified number and returns this generator. If *value* is not specified, returns the current animation duration.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>0</code> | 

<a name="textBox.ellipsis"></a>

#### textBox.ellipsis([*value*])
If *value* is specified, sets the ellipsis method to the specified function or string and returns this generator. If *value* is not specified, returns the current ellipsis method, which simply adds an ellipsis to the string by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d + "...";
}
```
<a name="textBox.fontColor"></a>

#### textBox.fontColor([*value*])
If *value* is specified, sets the font color accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font color accessor, which is inferred from the [container element](#textBox.select) by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="textBox.fontFamily"></a>

#### textBox.fontFamily([*value*])
If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family accessor, which is inferred from the [container element](#textBox.select) by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="textBox.fontMax"></a>

#### textBox.fontMax([*value*])
If *value* is specified, sets the maximum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current maximum font size accessor. The maximum font size is used when [resizing fonts](#textBox.fontResize) dynamically.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | <code>50</code> | 

<a name="textBox.fontMin"></a>

#### textBox.fontMin([*value*])
If *value* is specified, sets the minimum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current minimum font size accessor. The minimum font size is used when [resizing fonts](#textBox.fontResize) dynamically.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | <code>8</code> | 

<a name="textBox.fontResize"></a>

#### textBox.fontResize([*value*])
If *value* is specified, sets the font resizing accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current font resizing accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Boolean</code> | <code>false</code> | 

<a name="textBox.fontSize"></a>

#### textBox.fontSize([*value*])
If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size accessor, which is inferred from the [container element](#textBox.select) by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="textBox.height"></a>

#### textBox.height([*value*])
If *value* is specified, sets the height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current height accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d.height || 200;
}
```
<a name="textBox.id"></a>

#### textBox.id([*value*])
If *value* is specified, sets the id accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current id accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example** *(default accessor)*  
```js
function(d, i) {
  return d.id || i + "";
}
```
<a name="textBox.lineHeight"></a>

#### textBox.lineHeight([*value*])
If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textBox.fontSize) by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="textBox.on"></a>

#### textBox.on([*typenames*], [*listener*])
Adds or removes a *listener* to each box for the specified event *typenames*. If a *listener* is not specified, returns the currently-assigned listener for the specified event *typename*. Mirrors the core [d3-selection](https://github.com/d3/d3-selection#selection_on) behavior.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*typenames*] | <code>String</code> | 
| [*listener*] | <code>function</code> | 

<a name="textBox.overflow"></a>

#### textBox.overflow([*value*])
If *value* is specified, sets the overflow accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current overflow accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>Boolean</code> | <code>false</code> | 

<a name="textBox.select"></a>

#### textBox.select([*selector*])
If *selector* is specified, sets the SVG container element to the specified d3 selector or DOM element and returns this generator. If *selector* is not specified, returns the current SVG container element, which adds an SVG element to the page by default.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*selector*] | <code>String</code> &#124; <code>HTMLElement</code> | 

<a name="textBox.split"></a>

#### textBox.split([*value*])
If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [*value*] | <code>function</code> | A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&` |

<a name="textBox.text"></a>

#### textBox.text([*value*])
If *value* is specified, sets the text accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current text accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d.text;
}
```
<a name="textBox.textAnchor"></a>

#### textBox.textAnchor([*value*])
If *value* is specified, sets the horizontal text anchor accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current horizontal text anchor accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | <code>&quot;start&quot;</code> | Analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property. |

<a name="textBox.verticalAlign"></a>

#### textBox.verticalAlign([*value*])
If *value* is specified, sets the vertical alignment accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current vertical alignment accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | <code>&quot;top&quot;</code> | Accepts `"top"`, `"middle"`, and `"bottom"`. |

<a name="textBox.width"></a>

#### textBox.width([*value*])
If *value* is specified, sets the width accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current width accessor.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d.width || 200;
}
```
<a name="textBox.x"></a>

#### textBox.x([*value*])
If *value* is specified, sets the x accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current x accessor. The number returned should correspond to the left position of the textBox.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d.x || 0;
}
```
<a name="textBox.y"></a>

#### textBox.y([*value*])
If *value* is specified, sets the y accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current y accessor. The number returned should correspond to the top position of the textBox.

**Kind**: static method of <code>[textBox](#textBox)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

**Example** *(default accessor)*  
```js
function(d) {
  return d.y || 0;
}
```
<a name="textSplit"></a>

### textSplit(sentence)
Splits a given sentence into an array of words.

**Kind**: global function  

| Param | Type |
| --- | --- |
| sentence | <code>String</code> | 

<a name="textWidth"></a>

### textWidth(text, [style])
Given a text string, returns the predicted pixel width of the string when placed into DOM.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>String</code> &#124; <code>Array</code> | Can be either a single string or an array of strings to analyze. |
| [style] | <code>Object</code> | An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values. |

<a name="textWrap"></a>

### textWrap()
Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.

**Kind**: global function  

* [textWrap()](#textWrap)
    * [.fontFamily([*value*])](#textWrap.fontFamily)
    * [.fontSize([*value*])](#textWrap.fontSize)
    * [.height([*value*])](#textWrap.height)
    * [.lineHeight([*value*])](#textWrap.lineHeight)
    * [.overflow([*value*])](#textWrap.overflow)
    * [.split([*value*])](#textWrap.split)
    * [.width([*value*])](#textWrap.width)

<a name="textWrap.fontFamily"></a>

#### textWrap.fontFamily([*value*])
If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>String</code> | 

<a name="textWrap.fontSize"></a>

#### textWrap.fontSize([*value*])
If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="textWrap.height"></a>

#### textWrap.height([*value*])
If *value* is specified, sets height limit to the specified value and returns this generator. If *value* is not specified, returns the current value.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>200</code> | 

<a name="textWrap.lineHeight"></a>

#### textWrap.lineHeight([*value*])
If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textWrap.fontSize) by default.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type |
| --- | --- |
| [*value*] | <code>function</code> &#124; <code>Number</code> | 

<a name="textWrap.overflow"></a>

#### textWrap.overflow([*value*])
If *value* is specified, sets the overflow to the specified boolean and returns this generator. If *value* is not specified, returns the current overflow value.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Boolean</code> | <code>false</code> | 

<a name="textWrap.split"></a>

#### textWrap.split([*value*])
If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [*value*] | <code>function</code> | A function that, when passed a string, is expected to return that string split into an array of words to textWrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&` |

<a name="textWrap.width"></a>

#### textWrap.width([*value*])
If *value* is specified, sets width limit to the specified value and returns this generator. If *value* is not specified, returns the current value.

**Kind**: static method of <code>[textWrap](#textWrap)</code>  

| Param | Type | Default |
| --- | --- | --- |
| [*value*] | <code>Number</code> | <code>200</code> | 



###### <sub>Documentation generated on Wed, 20 Jul 2016 21:44:18 GMT</sub>
