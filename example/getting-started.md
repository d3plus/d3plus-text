[width]: 700
[height]: 75

# Wrapping SVG Text

Without a doubt, the most commonly requested part of the [d3plus-text](https://github.com/d3plus/d3plus-text) module is [textBox](http://d3plus.org/docs/#TextBox), which is used for intelligently wrapping SVG text. At it's core, it accepts an array of data points containing `"text"` keys and adds them to the page using a set of defaults. Here is a data array containing 3 different sentences to be wrapped:

```js
var data = [
  {text: "Here is <i>some</i> sample text that has been <strong>wrapped</strong> using d3plus.textBox."},
  {text: "...and here is a <b>second</b> sentence!"},
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
