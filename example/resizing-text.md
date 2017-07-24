[width]: 450
[height]: 100

# Text Wrapping Dynamic Font Resizing to Fit Container

A useful method when using text to label shapes (like in a [tree map](http://d3plus.org/examples/d3plus-hierarchy/getting-started/)) is the [fontResize](http://d3plus.org/docs/#TextBox.fontResize) method of the [textBox](http://d3plus.org/docs/#TextBox) class. When set to `true`, the text will attempt to scale up or down it's font-size to best fit the containing shape.

```js
var data = [
  {text: "This is a sentence that will not be resized.", resize: false},
  {text: "This is a sentence that will be resized.", resize: true}
];
```

Here, we can compare the output of using the [fontResize](http://d3plus.org/docs/#TextBox.fontResize) method against the normal output, given a 200 x 100 rectangle boundary.

```js
new d3plus.TextBox()
  .data(data)
  .fontResize(function(d) { return d.resize; })
  .height(100)
  .width(200)
  .x(function(d, i) { return i * 250; })
  .render();
```

The font-size calculated by this method is constrained by the [fontMin](http://d3plus.org/docs/#TextBox.fontMin) and [fontMax](http://d3plus.org/docs/#TextBox.fontMax) methods, which default to `8` and `50` respectively.
