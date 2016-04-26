import {default as measure} from "./width";
import {default as defaultSplit} from "./split";
import {default as stringify} from "./stringify";

/**
    @function wrap
    @desc Based on the defined styles and dimensions, breaks a string into an array of strings for each line of text.
*/
export default function() {

  let fontFamily = "sans-serif",
      fontSize = 10,
      height = 200,
      lineHeight,
      overflow = false,
      split = defaultSplit,
      width = 200;

  /**
      The inner return object and wraps the text and returns the line data array.
      @private
  */
  function wrap(sentence) {

    sentence = stringify(sentence);

    if (lineHeight === void 0) lineHeight = Math.ceil(fontSize * 1.1);

    const words = split(sentence);

    const style = {
      "font-family": fontFamily,
      "font-size": fontSize,
      "line-height": lineHeight
    };

    let line = 1,
        textProg = "",
        truncated = false,
        widthProg = 0;

    const lineData = [""],
          sizes = measure(words, style),
          space = measure(" ", style);

    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      const nextChar = sentence.charAt(textProg.length + word.length),
            wordWidth = sizes[words.indexOf(word)];
      if (nextChar === " ") word += nextChar;
      if (widthProg + wordWidth > width - fontSize) {
        lineData[line - 1] = lineData[line - 1].trimRight();
        line++;
        if (lineHeight * line > height || wordWidth > width && !overflow) {
          truncated = true;
          break;
        }
        widthProg = 0;
        lineData.push(word);
      }
      else lineData[line - 1] += word;
      textProg += word;
      widthProg += wordWidth;
      if (nextChar === " ") widthProg += space;
    }

    return {
      "lines": lineData,
      sentence, truncated
    };

  }

  /**
      @memberof wrap
      @desc If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family.
      @param {Function|String} [*value*]
  */
  wrap.fontFamily = function(_) {
    return arguments.length ? (fontFamily = _, wrap) : fontFamily;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size.
      @param {Function|Number} [*value*]
  */
  wrap.fontSize = function(_) {
    return arguments.length ? (fontSize = _, wrap) : fontSize;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets height limit to the specified value and returns this generator. If *value* is not specified, returns the current value.
      @param {Number} [*value* = 200]
  */
  wrap.height = function(_) {
    return arguments.length ? (height = _, wrap) : height;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#wrap.fontSize) by default.
      @param {Function|Number} [*value*]
  */
  wrap.lineHeight = function(_) {
    return arguments.length ? (lineHeight = _, wrap) : lineHeight;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets the overflow to the specified boolean and returns this generator. If *value* is not specified, returns the current overflow value.
      @param {Boolean} [*value* = false]
  */
  wrap.overflow = function(_) {
    return arguments.length ? (overflow = _, wrap) : overflow;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.
      @param {Function} [*value*] A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&`
  */
  wrap.split = function(_) {
    return arguments.length ? (split = _, wrap) : split;
  };

  /**
      @memberof wrap
      @desc If *value* is specified, sets width limit to the specified value and returns this generator. If *value* is not specified, returns the current value.
      @param {Number} [*value* = 200]
  */
  wrap.width = function(_) {
    return arguments.length ? (width = _, wrap) : width;
  };

  return wrap;

}
