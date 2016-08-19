import {select} from "d3-selection";
import {transition} from "d3-transition";
import {max, min, sum} from "d3-array";

import {accessor, BaseClass, constant} from "d3plus-common";
import {default as textSplit} from "./textSplit";
import {default as measure} from "./textWidth";
import {default as wrap} from "./textWrap";

/**
    @function TextBox
    @extends BaseClass
    @desc Creates a wrapped text box for each point in an array of data. See [this example](https://d3plus.org/examples/d3plus-text/getting-started/) for help getting started using the textBox function.
*/
export default class TextBox extends BaseClass {

  constructor() {

    super();

    this._delay = 0;
    this._duration = 0;
    this._ellipsis = _ => `${_.replace(/\.|,$/g, "")}...`;
    this._fontColor = constant("black");
    this._fontFamily = constant("Verdana");
    this._fontMax = constant(50);
    this._fontMin = constant(8);
    this._fontResize = constant(false);
    this._fontSize = constant(10);
    this._height = accessor("height", 200);
    this._id = (d, i) => d.id || `${i}`;
    this._on = {};
    this._overflow = constant(false);
    this._rotate = constant(0);
    this._split = textSplit;
    this._text = accessor("text");
    this._textAnchor = constant("start");
    this._verticalAlign = constant("top");
    this._width = accessor("width", 200);
    this._x = accessor("x", 0);
    this._y = accessor("y", 0);

  }

  /**
      @memberof TextBox
      @desc Renders the text boxes. If a *callback* is specified, it will be called once the shapes are done drawing.
      @param {Function} [*callback* = undefined]
  */
  render(callback) {

    if (this._select === void 0) this.select(select("body").append("svg").style("width", `${window.innerWidth}px`).style("height", `${window.innerHeight}px`).node());
    if (this._lineHeight === void 0) this._lineHeight = (d, i) => this._fontSize(d, i) * 1.1;
    const that = this;

    const boxes = this._select.selectAll(".d3plus-textBox").data(this._data.reduce((arr, d, i) => {

      const t = this._text(d, i);
      if (t === void 0) return arr;

      const resize = this._fontResize(d, i);

      let fS = resize ? this._fontMax(d, i) : this._fontSize(d, i),
          lH = resize ? fS * 1.1 : this._lineHeight(d, i),
          line = 1,
          lineData = [],
          sizes;

      const style = {
        "font-family": this._fontFamily(d, i),
        "font-size": fS,
        "line-height": lH
      };

      const h = this._height(d, i),
            w = this._width(d, i);

      const wrapper = wrap()
        .fontFamily(style["font-family"])
        .fontSize(fS)
        .lineHeight(lH)
        .height(h)
        .overflow(this._overflow(d, i))
        .width(w);

      const fMax = this._fontMax(d, i),
            fMin = this._fontMin(d, i),
            vA = this._verticalAlign(d, i),
            words = this._split(t, i);

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
          else {
            lineData[line - 2] = that._ellipsis(lineData[line - 2]);
            lineData = lineData.slice(0, line - 1);
          }

        }


      }

      if (w > fMin && (h > lH || resize && h > fMin * 1.1)) {

        if (resize) {

          sizes = measure(words, style);

          const areaMod = 1.165 + w / h * 0.1,
                boxArea = w * h,
                maxWidth = max(sizes),
                textArea = sum(sizes, d => d * lH) * areaMod;

          if (maxWidth > w || textArea > boxArea) {
            const areaRatio = Math.sqrt(boxArea / textArea),
                  widthRatio = w / maxWidth;
            const sizeRatio = min([areaRatio, widthRatio]);
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
          data: d,
          lines: lineData,
          fC: this._fontColor(d, i),
          fF: style["font-family"],
          id: this._id(d, i),
          tA: this._textAnchor(d, i),
          fS, lH, w, x: this._x(d, i), y: this._y(d, i) + yP
        });

      }

      return arr;

    }, []), this._id);

    const t = transition().duration(this._duration);

    if (this._duration === 0) {

      boxes.exit().remove();

    }
    else {

      boxes.exit().transition().delay(this._duration).remove();

      boxes.exit().selectAll("tspan").transition(t)
        .attr("opacity", 0);

    }

    function rotate(text) {
      text.attr("transform", (d, i) => `rotate(${that._rotate(d, i)} ${d.x + d.w / 2} ${d.y + d.lH / 4 + d.lH * d.lines.length / 2})`);
    }

    const update = boxes.enter().append("text")
        .attr("class", "d3plus-textBox")
        .attr("id", d => `d3plus-textBox-${d.id}`)
        .attr("y", d => `${d.y}px`)
        .call(rotate)
      .merge(boxes);

    update
      .attr("fill", d => d.fC)
      .attr("text-anchor", d => d.tA)
      .attr("font-family", d => d.fF)
      .style("font-family", d => d.fF)
      .attr("font-size", d => `${d.fS}px`)
      .style("font-size", d => `${d.fS}px`)
      .each(function(d) {

        const dx = d.tA === "start" ? 0 : d.tA === "end" ? d.w : d.w / 2,
              tB = select(this);

        if (that._duration === 0) tB.attr("y", d => `${d.y}px`);
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

        const tspans = tB.selectAll("tspan").data(d.lines);

        if (that._duration === 0) {

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
            .transition(t).delay(that._delay)
              .attr("opacity", 1);

        }

      })
      .transition(t).call(rotate);

    const events = Object.keys(this._on),
          on = events.reduce((obj, e) => {
            obj[e] = (d, i) => this._on[e](d.data, i);
            return obj;
          }, {});
    for (let e = 0; e < events.length; e++) update.on(events[e], on[events[e]]);

    if (callback) setTimeout(callback, this._duration + 100);

    return this;

  }

  /**
      @memberof TextBox
      @desc If *data* is specified, sets the data array to the specified array and returns this generator. If *data* is not specified, returns the current data array. A text box will be drawn for each object in the array.
      @param {Array} [*data* = []]
  */
  data(_) {
    return arguments.length ? (this._data = _, this) : this._data;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the animation delay to the specified number and returns this generator. If *value* is not specified, returns the current animation delay.
      @param {Number} [*value* = 0]
  */
  delay(_) {
    return arguments.length ? (this._delay = _, this) : this._delay;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the animation duration to the specified number and returns this generator. If *value* is not specified, returns the current animation duration.
      @param {Number} [*value* = 0]
  */
  duration(_) {
    return arguments.length ? (this._duration = _, this) : this._duration;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the ellipsis method to the specified function or string and returns this generator. If *value* is not specified, returns the current ellipsis method, which simply adds an ellipsis to the string by default.
      @param {Function|String} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d + "...";
}
  */
  ellipsis(_) {
    return arguments.length ? (this._ellipsis = typeof _ === "function" ? _ : constant(_), this) : this._ellipsis;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the font color accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font color accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|String} [*value* = "black"]
  */
  fontColor(_) {
    return arguments.length ? (this._fontColor = typeof _ === "function" ? _ : constant(_), this) : this._fontColor;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the font family accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current font family accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|String} [*value* = "Verdana"]
  */
  fontFamily(_) {
    return arguments.length ? (this._fontFamily = typeof _ === "function" ? _ : constant(_), this) : this._fontFamily;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the maximum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current maximum font size accessor. The maximum font size is used when [resizing fonts](#textBox.fontResize) dynamically.
      @param {Function|Number} [*value* = 50]
  */
  fontMax(_) {
    return arguments.length ? (this._fontMax = typeof _ === "function" ? _ : constant(_), this) : this._fontMax;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the minimum font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current minimum font size accessor. The minimum font size is used when [resizing fonts](#textBox.fontResize) dynamically.
      @param {Function|Number} [*value* = 8]
  */
  fontMin(_) {
    return arguments.length ? (this._fontMin = typeof _ === "function" ? _ : constant(_), this) : this._fontMin;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the font resizing accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current font resizing accessor.
      @param {Function|Boolean} [*value* = false]
  */
  fontResize(_) {
    return arguments.length ? (this._fontResize = typeof _ === "function" ? _ : constant(_), this) : this._fontResize;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the font size accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current font size accessor, which is inferred from the [container element](#textBox.select) by default.
      @param {Function|Number} [*value* = 10]
  */
  fontSize(_) {
    return arguments.length ? (this._fontSize = typeof _ === "function" ? _ : constant(_), this) : this._fontSize;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current height accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.height || 200;
}
  */
  height(_) {
    return arguments.length ? (this._height = typeof _ === "function" ? _ : constant(_), this) : this._height;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the id accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current id accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d, i) {
  return d.id || i + "";
}
  */
  id(_) {
    return arguments.length ? (this._id = typeof _ === "function" ? _ : constant(_), this) : this._id;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the line height accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current line height accessor, which is 1.1 times the [font size](#textBox.fontSize) by default.
      @param {Function|Number} [*value*]
  */
  lineHeight(_) {
    return arguments.length ? (this._lineHeight = typeof _ === "function" ? _ : constant(_), this) : this._lineHeight;
  }

  /**
      @memberof TextBox
      @desc Adds or removes a *listener* to each box for the specified event *typenames*. If a *listener* is not specified, returns the currently-assigned listener for the specified event *typename*. Mirrors the core [d3-selection](https://github.com/d3/d3-selection#selection_on) behavior.
      @param {String} [*typenames*]
      @param {Function} [*listener*]
  */
  on(typenames, listener) {
    return arguments.length === 2 ? (this._on[typenames] = listener, this) : arguments.length ? this._on[typenames] : this._on;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the overflow accessor to the specified function or boolean and returns this generator. If *value* is not specified, returns the current overflow accessor.
      @param {Function|Boolean} [*value* = false]
  */
  overflow(_) {
    return arguments.length ? (this._overflow = typeof _ === "function" ? _ : constant(_), this) : this._overflow;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the rotate accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current rotate accessor.
      @param {Function|Number} [*value* = 0]
  */
  rotate(_) {
    return arguments.length ? (this._rotate = typeof _ === "function" ? _ : constant(_), this) : this._rotate;
  }

  /**
      @memberof TextBox
      @desc If *selector* is specified, sets the SVG container element to the specified d3 selector or DOM element and returns this generator. If *selector* is not specified, returns the current SVG container element, which adds an SVG element to the page by default.
      @param {String|HTMLElement} [*selector*]
  */
  select(_) {
    return arguments.length ? (this._select = select(_), this) : this._select;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the word split function to the specified function and returns this generator. If *value* is not specified, returns the current word split function.
      @param {Function} [*value*] A function that, when passed a string, is expected to return that string split into an array of words to wrap. The default split function splits strings on the following characters: `-`, `/`, `;`, `:`, `&`
  */
  split(_) {
    return arguments.length ? (this._split = _, this) : this._split;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the text accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current text accessor.
      @param {Function|String} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.text;
}
  */
  text(_) {
    return arguments.length ? (this._text = typeof _ === "function" ? _ : constant(_), this) : this._text;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the horizontal text anchor accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current horizontal text anchor accessor.
      @param {Function|String} [*value* = "start"] Analagous to the SVG [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) property.
  */
  textAnchor(_) {
    return arguments.length ? (this._textAnchor = typeof _ === "function" ? _ : constant(_), this) : this._textAnchor;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the vertical alignment accessor to the specified function or string and returns this generator. If *value* is not specified, returns the current vertical alignment accessor.
      @param {Function|String} [*value* = "top"] Accepts `"top"`, `"middle"`, and `"bottom"`.
  */
  verticalAlign(_) {
    return arguments.length ? (this._verticalAlign = typeof _ === "function" ? _ : constant(_), this) : this._verticalAlign;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the width accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current width accessor.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.width || 200;
}
  */
  width(_) {
    return arguments.length ? (this._width = typeof _ === "function" ? _ : constant(_), this) : this._width;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the x accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current x accessor. The number returned should correspond to the left position of the textBox.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.x || 0;
}
  */
  x(_) {
    return arguments.length ? (this._x = typeof _ === "function" ? _ : constant(_), this) : this._x;
  }

  /**
      @memberof TextBox
      @desc If *value* is specified, sets the y accessor to the specified function or number and returns this generator. If *value* is not specified, returns the current y accessor. The number returned should correspond to the top position of the textBox.
      @param {Function|Number} [*value*]
      @example <caption>default accessor</caption>
function(d) {
  return d.y || 0;
}
  */
  y(_) {
    return arguments.length ? (this._y = typeof _ === "function" ? _ : constant(_), this) : this._y;
  }

}
