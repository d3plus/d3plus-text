import {select as d3Select} from "d3-selection";
import {transition as d3Transition} from "d3-transition";
import {max as d3Max, min as d3Min, sum as d3Sum} from "d3-array";
const d3 = {
  max: d3Max,
  min: d3Min,
  select: d3Select,
  sum: d3Sum,
  transition: d3Transition
};

import {accessor, constant} from "d3plus-common";
import {default as textSplit} from "./textSplit";
import {default as measure} from "./textWidth";
import {default as wrap} from "./textWrap";

/**
    The default id accessor function.
    @private
*/
function boxId(d, i) {
  return d.id || `${i}`;
}


/**
    @function textBox
    @desc Creates a wrapped text box based on an array of data. If *data* is specified, immediately wraps the text based on the specified array and returns this generator. If *data* is not specified on instantiation, it can be passed/updated after instantiation using the [data](#textBox.data) method. See [this example](https://d3plus.org/examples/d3plus-text/getting-started/) for help getting started using the textBox function.
    @param {Array} [data = []] An array of text blocks to be wrapped.
*/
export default function(data = []) {

  /**
      The default ellipsis function.
      @private
  */
  function boxEllipsis(_) {
    return `${_}...`;
  }

  const on = {};

  let delay = 0,
      duration = 0,
      ellipsis = boxEllipsis,
      fontColor,
      fontFamily = constant("Verdana"),
      fontMax = constant(50),
      fontMin = constant(8),
      fontResize = constant(false),
      fontSize = constant(10),
      height = accessor("height", 200),
      id = boxId,
      lineHeight,
      overflow = constant(false),
      select,
      split = textSplit,
      text = accessor("text"),
      textAnchor = constant("start"),
      verticalAlign = constant("top"),
      width = accessor("width", 200),
      x = accessor("x", 0),
      y = accessor("y", 0);

  /**
      The inner return object and draw function that gets assigned the public methods.
      @private
  */
  function textBox(callback) {

    if (select === void 0) textBox.select(d3.select("body").append("svg").style("width", `${window.innerWidth}px`).style("height", `${window.innerHeight}px`).node());
    if (lineHeight === void 0) lineHeight = (d, i) => fontSize(d, i) * 1.1;

    const boxes = select.selectAll(".d3plus-textBox").data(data.reduce((arr, d, i) => {

      const t = text(d, i);
      if (t === void 0) return arr;

      const resize = fontResize(d, i);

      let fS = resize ? fontMax(d, i) : fontSize(d, i),
          lH = resize ? fS * 1.1 : lineHeight(d, i),
          line = 1,
          lineData = [],
          sizes;

      const style = {
        "font-family": fontFamily(d, i),
        "font-size": fS,
        "line-height": lH
      };

      const h = height(d, i),
            w = width(d, i);

      const wrapper = wrap()
        .fontFamily(style["font-family"])
        .fontSize(fS)
        .lineHeight(lH)
        .height(h)
        .overflow(overflow(d, i))
        .width(w);

      const fMax = fontMax(d, i),
            fMin = fontMin(d, i),
            vA = verticalAlign(d, i),
            words = split(t, i);

      /**
          Figures out the lineData to be used for wrapping.
          @private
      */
      function checkSize() {

        if (fS < fMin) {
          lineData = [];
          return;
        }
        else if (fS > fMax) fS = fMax;

        if (resize) {
          lH = fS * 1.1;
          wrapper
            .fontSize(fS)
            .lineHeight(lH);
          style["font-size"] = fS;
          style["line-height"] = lH;
        }

        const wrapResults = wrapper(t);
        lineData = wrapResults.lines;
        line = lineData.length;

        if (wrapResults.truncated) {

          if (resize) {
            fS--;
            if (fS < fMin) lineData = [];
            else checkSize();
          }
          else if (line === 2 && !lineData[line - 2].length) lineData = [];
          else lineData[line - 2] = ellipsis(lineData[line - 2]);

        }


      }

      if (w > fMin && (h > lH || resize && h > fMin * 1.1)) {

        if (resize) {

          sizes = measure(words, style);

          const areaMod = 1.165 + w / h * 0.1,
                boxArea = w * h,
                maxWidth = d3.max(sizes),
                textArea = d3.sum(sizes, d => d * lH) * areaMod;

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

      }

      if (lineData.length) {

        const tH = line * lH;
        let yP = vA === "top" ? 0 : vA === "middle" ? h / 2 - tH / 2 : h - tH;
        yP -= lH * 0.1;

        arr.push({
          data: lineData,
          fC: fontColor(d, i),
          fF: style["font-family"],
          id: id(d, i),
          tA: textAnchor(d, i),
          fS, lH, w, x: x(d, i), y: y(d, i) + yP
        });

      }

      return arr;

    }, []), id);

    const t = d3.transition().duration(duration);

    if (duration === 0) {

      boxes.exit().remove();

    }
    else {

      boxes.exit().transition().delay(duration).remove();

      boxes.exit().selectAll("tspan").transition(t)
        .attr("opacity", 0);

    }

    const update = boxes.enter().append("text")
        .attr("class", "d3plus-textBox")
        .attr("id", d => `d3plus-textBox-${d.id}`)
        .attr("y", d => `${d.y}px`)
      .merge(boxes)
        .attr("fill", d => d.fC)
        .attr("text-anchor", d => d.tA)
        .attr("font-family", d => d.fF)
        .each(function(d) {

          const dx = d.tA === "start" ? 0 : d.tA === "end" ? d.w : d.w / 2,
                tB = d3.select(this);

          if (duration === 0) tB.attr("y", d => `${d.y}px`);
          else tB.transition(t).attr("y", d => `${d.y}px`);

          /**
              Styles to apply to each <tspan> element.
              @private
          */
          function tspanStyle(tspan) {
            tspan
              .text(t => t.trimRight())
              .attr("x", `${d.x}px`)
              .attr("dx", `${dx}px`)
              .attr("dy", `${d.lH}px`);
          }

          const tspans = tB
            .attr("font-size", `${d.fS}px`)
            .style("font-size", `${d.fS}px`)
            .selectAll("tspan").data(d.data);

          if (duration === 0) {

            tspans.call(tspanStyle);

            tspans.exit().remove();

            tspans.enter().append("tspan")
              .attr("dominant-baseline", "alphabetic")
              .style("baseline-shift", "0%")
              .call(tspanStyle);

          }
          else {

            tspans.transition(t).call(tspanStyle);

            tspans.exit().transition(t)
              .attr("opacity", 0).remove();

            tspans.enter().append("tspan")
              .attr("dominant-baseline", "alphabetic")
              .style("baseline-shift", "0%")
              .attr("opacity", 0)
              .call(tspanStyle)
              .transition(t).delay(delay)
                .attr("opacity", 1);

          }

        });

    const events = Object.keys(on);
    for (let e = 0; e < events.length; e++) update.on(events[e], on[events[e]]);

    if (callback) setTimeout(callback, duration + 100);

    return textBox;

  }

  /**
      @memberof textBox
      @desc If *value* is specified, sets the methods that correspond to the key/value pairs and returns this generator. If *value* is not specified, returns the current configuration.
      @param {Object} [*value*]
  */
  textBox.config = function(_) {
    if (arguments.length) {
      for (const k in _) if ({}.hasOwnProperty.call(_, k)) textBox[k](_[k]);
      return textBox;
    }
    else {
      const config = {};
      for (const k in textBox.prototype.constructor) if (k !== "config" && {}.hasOwnProperty.call(textBox, k)) config[k] = textBox[k]();
      return config;
    }
  };

  /**
      @memberof textBox
      @desc If *data* is specified, sets the data array to the specified array and returns this generator. If *data* is not specified, returns the current data array. A text box will be drawn for each object in the array.
      @param {Array} [*data* = []]
  */
  textBox.data = function(_) {
    return arguments.length ? (data = _, textBox) : data;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the animation delay to the specified number and returns this generator. If *value* is not specified, returns the current animation delay.
      @param {Number} [*value* = 0]
  */
  textBox.delay = function(_) {
    return arguments.length ? (delay = _, textBox) : delay;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the animation duration to the specified number and returns this generator. If *value* is not specified, returns the current animation duration.
      @param {Number} [*value* = 0]
  */
  textBox.duration = function(_) {
    return arguments.length ? (duration = _, textBox) : duration;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the ellipsis method to the specified function or string and returns this generator. If *value* is not specified, returns the current ellipsis method, which simply adds an ellipsis to the string by default.
      @param {Function|String} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d + "...";
}
  */
  textBox.ellipsis = function(_) {
    return arguments.length ? (ellipsis = typeof _ === "function" ? _ : constant(_), textBox) : ellipsis;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the font color accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font color accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|String} [*value*]
  */
  textBox.fontColor = function(_) {
    return arguments.length ? (fontColor = typeof _ === "function" ? _ : constant(_), textBox) : fontColor;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|String} [*value* = "Verdana"]
  */
  textBox.fontFamily = function(_) {
    return arguments.length ? (fontFamily = typeof _ === "function" ? _ : constant(_), textBox) : fontFamily;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the maximum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current maximum font size accessor. The maximum font size is used when [resizing fonts](#textBox.fontResize) dynamically.
      @param {Function|Number} [*value* = 50]
  */
  textBox.fontMax = function(_) {
    return arguments.length ? (fontMax = typeof _ === "function" ? _ : constant(_), textBox) : fontMax;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the minimum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current minimum font size accessor. The minimum font size is used when [resizing fonts](#textBox.fontResize) dynamically.
      @param {Function|Number} [*value* = 8]
  */
  textBox.fontMin = function(_) {
    return arguments.length ? (fontMin = typeof _ === "function" ? _ : constant(_), textBox) : fontMin;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the font resizing accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current font resizing accessor.
      @param {Function|Boolean} [*value* = false]
  */
  textBox.fontResize = function(_) {
    return arguments.length ? (fontResize = typeof _ === "function" ? _ : constant(_), textBox) : fontResize;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|Number} [*value* = 10]
  */
  textBox.fontSize = function(_) {
    return arguments.length ? (fontSize = typeof _ === "function" ? _ : constant(_), textBox) : fontSize;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current height accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.height || 200;
}
  */
  textBox.height = function(_) {
    return arguments.length ? (height = typeof _ === "function" ? _ : constant(_), textBox) : height;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the id accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current id accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d, i) {
  return d.id || i + "";
}
  */
  textBox.id = function(_) {
    return arguments.length ? (id = typeof _ === "function" ? _ : constant(_), textBox) : id;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textBox.fontSize) by default.
      @param {Function|Number} [*value*]
  */
  textBox.lineHeight = function(_) {
    return arguments.length ? (lineHeight = typeof _ === "function" ? _ : constant(_), textBox) : lineHeight;
  };

  /**
      @memberof textBox
      @desc Adds or removes a *listener* to each box for the specified event *typenames*. If a *listener* is not specified, returns the currently-assigned listener for the specified event *typename*. Mirrors the core [d3-selection](https://github.com/d3/d3-selection#selection_on) behavior.
      @param {String} [*typenames*]
      @param {Function} [*listener*]
  */
  textBox.on = function(typenames, listener) {
    return arguments.length === 2 ? (on[typenames] = listener, textBox) : arguments.length ? on[typenames] : on;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the overflow accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current overflow accessor.
      @param {Function|Boolean} [*value* = false]
  */
  textBox.overflow = function(_) {
    return arguments.length ? (overflow = typeof _ === "function" ? _ : constant(_), textBox) : overflow;
  };

  /**
      @memberof textBox
      @desc If *selector* is specified, sets the SVG container element to the specified d3 selector or DOM element and returns this generator. If *selector* is not specified, returns the current SVG container element, which adds an SVG element to the page by default.
      @param {String|HTMLElement} [*selector*]
  */
  textBox.select = function(_) {
    if (arguments.length) {
      select = d3.select(_);
      if (fontColor === void 0) textBox.fontColor(select.style("font-color"));
      if (fontFamily === void 0) textBox.fontFamily(select.style("font-family"));
      if (fontSize === void 0) textBox.fontSize(parseFloat(select.style("font-size"), 10));
      return textBox;
    }
    return select;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.
      @param {Function} [*value*] A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&`
  */
  textBox.split = function(_) {
    return arguments.length ? (split = _, textBox) : split;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the text accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current text accessor.
      @param {Function|String} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.text;
}
  */
  textBox.text = function(_) {
    return arguments.length ? (text = typeof _ === "function" ? _ : constant(_), textBox) : text;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the horizontal text anchor accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current horizontal text anchor accessor.
      @param {Function|String} [*value* = "start"] Analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property.
  */
  textBox.textAnchor = function(_) {
    return arguments.length ? (textAnchor = typeof _ === "function" ? _ : constant(_), textBox) : textAnchor;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the vertical alignment accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current vertical alignment accessor.
      @param {Function|String} [*value* = "top"] Accepts `"top"`, `"middle"`, and `"bottom"`.
  */
  textBox.verticalAlign = function(_) {
    return arguments.length ? (verticalAlign = typeof _ === "function" ? _ : constant(_), textBox) : verticalAlign;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the width accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current width accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.width || 200;
}
  */
  textBox.width = function(_) {
    return arguments.length ? (width = typeof _ === "function" ? _ : constant(_), textBox) : width;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the x accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current x accessor. The number returned should correspond to the left position of the textBox.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.x || 0;
}
  */
  textBox.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(_), textBox) : x;
  };

  /**
      @memberof textBox
      @desc If *value* is specified, sets the y accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current y accessor. The number returned should correspond to the top position of the textBox.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.y || 0;
}
  */
  textBox.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(_), textBox) : y;
  };

  return data.length ? textBox() : textBox;

}
