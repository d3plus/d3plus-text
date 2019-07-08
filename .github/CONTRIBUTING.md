# Contributing

We love Pull Requests from anyone and everyone. To get started, fork the repo, then clone your fork:

```sh
git clone git@github.com:your-username/d3plus-text.git
```

## Setting up your Environment

1. Install Node Package Manager (NPM).
> <sub>If on a Mac, we suggest using [Homebrew](http://brew.sh/) to install packages on your machine. Once that's installed, you can install node (which includes npm) by running: `brew install node`</sub>
2. Install all repository dependencies:
```sh
npm i
```

And that's it! Now your environment should be all set up and ready to go.

## Writing Code

With the introduction of modules in D3plus 2.0, all code is transpiled using [babel](https://babeljs.io/), which allows usage of most of the good bits from ES6. If you are unfamiliar with ES6, then normal vanilla javascript works fine as well (but we may suggest PR revisions to include more succinct ES6). All source code lives in the `./src` directory.

## Code Style

Every d3plus module adheres to the same `.eslintrc` ruleset for javascript syntax. This helps user contribution, as it guarantees a cohesive and easy to read code style throughout every module. The easiest way to follow the style guide is by installing a linter directly in your text editor, so that errors will be highlighted as you type. If your Pull Request does not match the project's linting style, it will not be merged.

## Running the Development Server

To test your code live in a browser, with auto-compiling and hot reloading, type this into your shell:

```sh
npm run dev
```

You can then go to `http://localhost:4000/dev/` in your preferred browser to test your code live. Please store all test pages in the hidden `./dev` directory so that they do not get pushed to the repository. Here is a boilerplate HTML file to get your started:

```html
<script src="../build/d3plus-text.full.js"></script>
<body>

</body>
<script>

</script>
```
The development server detects any time a source file is modified, and will rebuild the browser javascript package and reload any open browser connections when a change occurs.

## Code Documentation

All of the Documentation you see in the README file is generated auto-magically from the [JSDoc](http://usejsdoc.org/) formatted comments within each source file. This removes the nuisance of having to write documentation after the fact, and enforces strict code commenting. To regenerate the documentation at any time, simply run:

```sh
npm run docs
```

> This command is run automatically during the release process.

## Tests

Any time you write a new feature for a module, you should also be writing tests. D3plus modules come bundled with a test suite that let's you write tests using full ES6, which are then run directly in a headless Electron browser.

All tests need to be placed in the `./test` directory, and the filenames should match up to the components in `./src`. To run all tests, run:

```sh
npm test
```
> This command will also lint all files according to the provided `.eslintc` file.

D3plus uses [zora](https://github.com/lorenzofox3/zora) for running tests, and [tape-run](https://github.com/juliangruber/tape-run) for outputting the results. Here is an example of what a test file could look like:

```js
import {test} from "zora";

test("testing booleans", assert => {

  assert.equal(true, true, "testing true");
  assert.equal(false, false, "testing false");

});

test("testing numbers", assert => {

  assert.equal(1, 1, "testing 1");
  assert.equal(2, 2, "testing 2");

});

export default test;
```

## Examples

All D3plus 2.0 examples seen on [d3plus.org](https://d3plus.org) are created from within their respective repositories. The examples are parsed from any markdown files placed in the `./example` directory, with the following behaviors:

#### Title

Example titles are extracted from the first H1 present in the file. Generally, the first line of the file will be the title:

```md
# My Cool Example
```

#### URL Slug

The slug used in the URL on [d3plus.org](https://d3plus.org) is taken directly from the filename. A file with the following path:

```sh
/example/my-cool-example.md
```

Would end up at the following URL:

```sh
https://d3plus.org/examples/d3plus-text/my-cool-example/
```

#### Code Blocks

Any `css`, `html`, or `js` code block present in an example will be extracted and rendered into a static HTML file. This is what gets used on [d3plus.org](https://d3plus.org), and also let's us take screenshots!

#### Screenshots

A screenshot of each example is generated from the rendered HTML. By default, each screenshot is 990x400 in size, but specific dimensions can be given using markdown relative links:

```md
[width]: 100
[height]: 100
```

Adding all that together, here is a sample of what a full example could look like:

`````md
[width]: 100
[height]: 100

# A Cool Red Square

In this example, we show you how to add a red square to a webpage!

```html
<div id="container"></div>
```

Wow, look at that container element. Such beauty.

```css
#container > div {
  background-color: red;
  height: 100px;
  width: 100px;
}
```

CSS. Amazing. Now let's finish this off with some JavaScript!

```js
var box = document.createElement("div");
document.getElementById("container").appendChild(box);
```

`````

## Submitting a Pull Request

Push to your fork and [submit a pull request](https://github.com/d3plus/d3plus-text/compare/). At this point, you're waiting on us. We may suggest some changes or improvements or alternatives.
