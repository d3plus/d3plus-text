# Getting Started

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
