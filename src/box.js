import {select as d3Select} from "d3-selection";
import {transition as d3Transition} from "d3-transition";
import {max as d3Max, min as d3Min, sum as d3Sum} from "d3-array";
const d3 = {
  "max": d3Max,
  "min": d3Min,
  "select": d3Select,
  "sum": d3Sum,
  "transition": d3Transition
};

import {default as constant} from "./constant";
import {default as measure} from "./width";

/**
    The default height accessor function.
    @private
*/
function boxHeight(d) {
  return d.height || 200;
}

/**
    The default id accessor function.
    @private
*/
function boxId(d, i) {
  return d.id || `${i}`;
}

const splitChars = ["-", "/", ";", ":", "&"],
      splitRegex = new RegExp(`[^\\s\\${splitChars.join("\\")}]+\\${splitChars.join("?\\")}?`, "g");

/**
    The default word split function.
    @private
*/
function boxSplit(_) {
  return _.match(splitRegex);
}

/**
    The default text accessor function.
    @private
*/
function boxText(d) {
  return d.text;
}

/**
    The default width accessor function.
    @private
*/
function boxWidth(d) {
  return d.width || 200;
}

/**
    The default x accessor function.
    @private
*/
function boxX(d) {
  return d.x || 0;
}

/**
    The default y accessor function.
    @private
*/
function boxY(d) {
  return d.y || 0;
}


/**
    @function box
    @desc Creates a wrapped text box based on an array of data. If *data* is specified, immediately wraps the text based on the specified array and returns this box generator. If *data* is not specified on instantiation, it can be passed/updated after instantiation using the [data](#box.data) method.
    @param {Array} [data = []]
    @example <caption>a sample row of data</caption>
var data = {"text": "Hello D3plus, please wrap this sentence for me."};
@example <caption>passed to the generator</caption>
box([data]);
@example <caption>creates the following</caption>
<text class="d3plus-text-box" id="d3plus-text-box-0" text-anchor="start" font-family="Helvetica Neue" font-size="16px" transform="translate(0,-3.6)">
  <tspan dominant-baseline="alphabetic" opacity="1" x="0px" dx="0px" dy="18px" style="baseline-shift: 0%;">
    Hello D3plus, please wrap
  </tspan>
  <tspan dominant-baseline="alphabetic" opacity="1" x="0px" dx="0px" dy="18px" style="baseline-shift: 0%;">
    this sentence for me.
  </tspan>
</text>
*/
export default function(data = []) {

  /**
      The default ellipsis function.
      @private
  */
  function boxEllipsis(_) {
    return `${_}...`;
  }

  let delay = 0,
      duration = 0,
      ellipsis = boxEllipsis,
      fontColor,
      fontFamily,
      fontMax = constant(50),
      fontMin = constant(8),
      fontResize = constant(false),
      fontSize,
      height = boxHeight,
      id = boxId,
      lineHeight,
      overflow = constant(false),
      select,
      split = boxSplit,
      text = boxText,
      textAnchor = constant("start"),
      verticalAlign = constant("top"),
      width = boxWidth,
      x = boxX,
      y = boxY;

  /**
      The inner return object and draw function that gets assigned the public methods.
      @private
  */
  function box() {

    if (select === void 0) box.select(d3.select("body").append("svg").style("width", `${window.innerWidth}px`).style("height", `${window.innerHeight}px`).node());

    const boxes = select.selectAll(".d3plus-text-box").data(data, id);

    boxes.exit().remove();

    boxes.enter().append("text")
        .attr("class", "d3plus-text-box")
        .attr("id", (d, i) => `d3plus-text-box-${id(d, i)}`)
      .merge(boxes)
        .attr("y", (d, i) => `${y(d, i)}px`)
        .attr("fill", (d, i) => fontColor(d, i))
        .attr("text-anchor", (d, i) => textAnchor(d, i))
        .attr("font-family", (d, i) => fontFamily(d, i))
        .each(function(d, i) {

          const resize = fontResize(d, i);

          let fS = resize ? fontMax(d, i) : fontSize(d, i),
              lH = resize ? fS * 1.1 : lineHeight(d, i),
              line = 1,
              lineData = [""],
              sizes;

          const style = {
            "font-family": fontFamily(d, i),
            "font-size": fS,
            "line-height": lH
          };

          const fMax = fontMax(d, i),
                fMin = fontMin(d, i),
                h = height(d, i),
                oF = overflow(d, i),
                space = measure(" ", style),
                t = text(d, i),
                tA = textAnchor(d, i),
                vA = verticalAlign(d, i),
                w = width(d, i),
                words = split(t, i);

          const dx = tA === "start" ? 0 : tA === "end" ? w : w / 2;

          /**
              Figures out the lineData to be used for wrapping.
              @private
          */
          function checkSize() {

            line = 1;
            lineData = [""];

            if (fS < fMin) {
              lineData = [];
              return;
            }
            else if (fS > fMax) fS = fMax;

            let textProg = "",
                widthProg = 0;

            if (resize) {
              lH = fS * 1.1;
              style["font-size"] = fS;
              style["line-height"] = lH;
            }

            sizes = measure(words, style);

            for (let i = 0; i < words.length; i++) {
              let word = words[i];
              const nextChar = t.charAt(textProg.length + word.length),
                    wordWidth = sizes[words.indexOf(word)];
              if (nextChar === " ") word += nextChar;
              if (widthProg + wordWidth > w - fS) {
                line++;
                if (lH * line > h || wordWidth > w && !oF) {
                  if (resize) {
                    fS--;
                    if (fS < fMin) {
                      lineData = [];
                      break;
                    }
                    checkSize();
                  }
                  else lineData[line - 2] = ellipsis(lineData[line - 2].trimRight());
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

          }

          if (h > lH || resize) {

            if (resize) {

              sizes = measure(words, style);

              const areaMod = 1.165 + w / h * 0.1,
                    boxArea = w * h,
                    maxWidth = d3.max(sizes),
                    textArea = d3.sum(sizes, (d) => d * lH) * areaMod;

              if (maxWidth > w || textArea > boxArea) {
                const areaRatio = Math.sqrt(boxArea / textArea),
                      widthRatio = w / maxWidth;
                const sizeRatio = d3.min([areaRatio, widthRatio]);
                fS = Math.floor(fS * sizeRatio);
              }

              const heightMax = Math.floor(h * 0.8);
              if (fS > heightMax) fS = heightMax;

            }

            checkSize();

            d3.select(this)
              .attr("font-size", `${fS}px`)
              .style("font-size", `${fS}px`);

          }

          const tH = line * lH;
          let y = vA === "top" ? 0 : vA === "middle" ? h / 2 - tH / 2 : h - tH;
          y -= lH * 0.2;

          d3.select(this).transition().duration(duration)
            .attr("transform", `translate(0,${y})`);

          /**
              Styles to apply to each <tspan> element.
              @private
          */
          function tspanStyle(tspan) {
            tspan
              .text((d) => d.trimRight())
              .attr("x", `${x(d, i)}px`)
              .attr("dx", `${dx}px`)
              .attr("dy", `${lH}px`);
          }

          const tspans = d3.select(this).selectAll("tspan").data(lineData);

          tspans.transition().duration(duration).call(tspanStyle);

          tspans.exit().transition().duration(duration)
            .attr("opacity", 0).remove();

          tspans.enter().append("tspan")
            .attr("dominant-baseline", "alphabetic")
            .style("baseline-shift", "0%")
            .attr("opacity", 0)
            .call(tspanStyle)
            .transition().duration(duration).delay(delay)
              .attr("opacity", 1);

        });

    return box;

  }

  /**
      @memberof box
      @desc If *data* is specified, sets the data array to the specified array and returns this box generator. If *data* is not specified, returns the current data array. A text box will be drawn for each object in the array.
      @param {Array} [*data* = []]
  */
  box.data = function(_) {
    return arguments.length ? (data = _, box) : data;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the animation delay to the specified number and returns this box generator. If *value* is not specified, returns the current animation delay.
      @param {Number} [*value* = 0]
  */
  box.delay = function(_) {
    return arguments.length ? (delay = _, box) : delay;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the animation duration to the specified number and returns this box generator. If *value* is not specified, returns the current animation duration.
      @param {Number} [*value* = 0]
  */
  box.duration = function(_) {
    return arguments.length ? (duration = _, box) : duration;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the ellipsis method to the specified function or string and returns this box generator. If *value* is not specified, returns the current ellipsis method, which simply adds an ellipsis to the string by default.
      @param {Function|String} [*value*]
      @example
function(d) {
  return d + "...";
}
  */
  box.ellipsis = function(_) {
    return arguments.length ? (ellipsis = typeof _ === "function" ? _ : constant(_), box) : ellipsis;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the font color accessor to the specified function or string and returns this box generator. If *value* is not specified, returns the current font color accessor, which is inferred from the [container element](#box.select) by default.
      @param {Function|String} [*value*]
  */
  box.fontColor = function(_) {
    return arguments.length ? (fontColor = typeof _ === "function" ? _ : constant(_), box) : fontColor;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the font family accessor to the specified function or string and returns this box generator. If *value* is not specified, returns the current font family accessor, which is inferred from the [container element](#box.select) by default.
      @param {Function|String} [*value*]
  */
  box.fontFamily = function(_) {
    return arguments.length ? (fontFamily = typeof _ === "function" ? _ : constant(_), box) : fontFamily;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the maximum font size accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current maximum font size accessor. The maximum font size is used when [resizing fonts](#box.fontResize) dynamically.
      @param {Function|Number} [*value* = 50]
  */
  box.fontMax = function(_) {
    return arguments.length ? (fontMax = typeof _ === "function" ? _ : constant(_), box) : fontMax;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the minimum font size accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current minimum font size accessor. The minimum font size is used when [resizing fonts](#box.fontResize) dynamically.
      @param {Function|Number} [*value* = 8]
  */
  box.fontMin = function(_) {
    return arguments.length ? (fontMin = typeof _ === "function" ? _ : constant(_), box) : fontMin;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the font resizing accessor to the specified function or boolean and returns this box generator. If *value* is not specified, returns the current font resizing accessor.
      @param {Function|Boolean} [*value* = false]
  */
  box.fontResize = function(_) {
    return arguments.length ? (fontResize = typeof _ === "function" ? _ : constant(_), box) : fontResize;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the font size accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current font size accessor, which is inferred from the [container element](#box.select) by default.
      @param {Function|Number} [*value*]
  */
  box.fontSize = function(_) {
    if (arguments.length) {
      fontSize = typeof _ === "function" ? _ : constant(_);
      if (lineHeight === void 0) lineHeight = constant(Math.ceil(fontSize() * 1.1));
      return box;
    }
    return fontSize;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the height accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current height accessor.
      @param {Function|Number} [*value*]
      @example
function(d) {
  return d.height || 200;
}
  */
  box.height = function(_) {
    return arguments.length ? (height = typeof _ === "function" ? _ : constant(_), box) : height;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the id accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current id accessor.
      @param {Function|Number} [*value*]
      @example
function(d, i) {
  return d.id || i + "";
}
  */
  box.id = function(_) {
    return arguments.length ? (id = typeof _ === "function" ? _ : constant(_), box) : id;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the line height accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#box.fontSize) by default.
      @param {Function|Number} [*value*]
  */
  box.lineHeight = function(_) {
    return arguments.length ? (lineHeight = typeof _ === "function" ? _ : constant(_), box) : lineHeight;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the overflow accessor to the specified function or boolean and returns this box generator. If *value* is not specified, returns the current overflow accessor.
      @param {Function|Boolean} [*value* = false]
  */
  box.overflow = function(_) {
    return arguments.length ? (overflow = typeof _ === "function" ? _ : constant(_), box) : overflow;
  };

  /**
      @memberof box
      @desc If *selector* is specified, sets the SVG container element to the specified d3 selector or DOM element and returns this box generator. If *selector* is not specified, returns the current SVG container element, which adds an SVG element to the page by default.
      @param {String|HTMLElement} [*selector*]
  */
  box.select = function(_) {
    if (arguments.length) {
      select = d3.select(_);
      if (fontColor === void 0) box.fontColor(select.style("font-color"));
      if (fontFamily === void 0) box.fontFamily(select.style("font-family"));
      if (fontSize === void 0) box.fontSize(parseFloat(select.style("font-size"), 10));
      return box;
    }
    return select;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the word split function to the specified function and returns this box generator. If *value* is not specified, returns the current word split function.
      @param {Function} [*value*] A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&`
  */
  box.split = function(_) {
    return arguments.length ? (split = _, box) : split;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the text accessor to the specified function or string and returns this box generator. If *value* is not specified, returns the current text accessor.
      @param {Function|String} [*value*]
      @example
function(d) {
  return d.text;
}
  */
  box.text = function(_) {
    return arguments.length ? (text = typeof _ === "function" ? _ : constant(_), box) : text;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the horizontal text anchor accessor to the specified function or string and returns this box generator. If *value* is not specified, returns the current horizontal text anchor accessor.
      @param {Function|String} [*value* = "start"] Analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property.
  */
  box.textAnchor = function(_) {
    return arguments.length ? (textAnchor = typeof _ === "function" ? _ : constant(_), box) : textAnchor;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the vertical alignment accessor to the specified function or string and returns this box generator. If *value* is not specified, returns the current vertical alignment accessor.
      @param {Function|String} [*value* = "top"] Accepts `"top"`, `"middle"`, and `"bottom"`.
  */
  box.verticalAlign = function(_) {
    return arguments.length ? (verticalAlign = typeof _ === "function" ? _ : constant(_), box) : verticalAlign;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the width accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current width accessor.
      @param {Function|Number} [*value*]
      @example
function(d) {
  return d.width || 200;
}
  */
  box.width = function(_) {
    return arguments.length ? (width = typeof _ === "function" ? _ : constant(_), box) : width;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the x accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current x accessor. The number returned should correspond to the left position of the box.
      @param {Function|Number} [*value*]
      @example
function(d) {
  return d.x || 0;
}
  */
  box.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(_), box) : x;
  };

  /**
      @memberof box
      @desc If *value* is specified, sets the y accessor to the specified function or number and returns this box generator. If *value* is not specified, returns the current y accessor. The number returned should correspond to the top position of the box.
      @param {Function|Number} [*value*]
      @example
function(d) {
  return d.y || 0;
}
  */
  box.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(_), box) : y;
  };

  return data.length ? box() : box;

}
