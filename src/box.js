import {default as d3} from "d3";
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
      fontSize,
      height = boxHeight,
      id = boxId,
      lineHeight,
      resize = false,
      select,
      split = boxSplit,
      text = boxText,
      textAnchor = constant("start"),
      verticalAlign = constant("top"),
      width = boxWidth,
      x = boxX,
      y = boxY;

  function box() {

    if (select === void 0) box.select(d3.select("body").append("svg").style("width", `${window.innerWidth}px`).style("height", `${window.innerHeight}px`).node());

    const boxes = select.selectAll(".d3plus-text-box").data(data, id);

    boxes.enter().append("text")
      .attr("class", "d3plus-text-box")
      .attr("id", (d, i) => `d3plus-text-box-${id(d, i)}`);

    boxes
      .attr("fill", (d, i) => fontColor(d, i))
      .attr("text-anchor", (d, i) => textAnchor(d, i))
      .attr("font-family", (d, i) => fontFamily(d, i))
      .each(function(d, i) {

        let fS = resize ? fontMax(d, i) : fontSize(d, i),
            lH = resize ? fS * 1.1 : lineHeight(d, i),
            line = 1,
            lineData = [""],
            sizes;

        const fMax = fontMax(d, i),
              fMin = fontMin(d, i),
              h = height(d, i),
              space = measure(" ", style),
              t = text(d, i),
              tA = textAnchor(d, i),
              vA = verticalAlign(d, i),
              w = width(d, i),
              words = split(t, i);

        const dx = tA === "start" ? 0 : tA === "end" ? w : w / 2;

        const style = {
          "font-family": fontFamily(d, i),
          "font-size": fS,
          "line-height": lH
        };

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

          console.log(fS, sizes);

          for (let word of words) {
            const wordWidth = sizes[words.indexOf(word)];
            if (wordWidth > w) break;
            const nextChar = t.charAt(textProg.length + word.length);
            if (nextChar === " ") word += nextChar;
            if (widthProg + wordWidth > w - fS) {
              line++;
              if (lH * line > h) {
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

        function tspanStyle(tspan) {
          tspan
            .text((d) => d.trimRight())
            .attr("x", `${x(d, i)}px`)
            .attr("dx", `${dx}px`)
            .attr("dy", `${lH}px`);
        }

        const tspans = d3.select(this).selectAll("tspan").data(lineData);

        tspans.exit().transition().duration(duration)
          .attr("opacity", 0).remove();

        tspans.transition().duration(duration).call(tspanStyle);

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

  box.data = function(_) {
    return arguments.length ? (data = _, box) : data;
  };

  box.delay = function(_) {
    return arguments.length ? (delay = _, box) : delay;
  };

  box.duration = function(_) {
    return arguments.length ? (duration = _, box) : duration;
  };

  box.ellipsis = function(_) {
    return arguments.length ? (ellipsis = typeof _ === "function" ? _ : constant(_), box) : ellipsis;
  };

  box.fontColor = function(_) {
    return arguments.length ? (fontColor = typeof _ === "function" ? _ : constant(_), box) : fontColor;
  };

  box.fontFamily = function(_) {
    return arguments.length ? (fontFamily = typeof _ === "function" ? _ : constant(_), box) : fontFamily;
  };

  box.fontMax = function(_) {
    return arguments.length ? (fontMax = typeof _ === "function" ? _ : constant(_), box) : fontMax;
  };

  box.fontMin = function(_) {
    return arguments.length ? (fontMin = typeof _ === "function" ? _ : constant(_), box) : fontMin;
  };

  box.fontSize = function(_) {
    if (arguments.length) {
      fontSize = typeof _ === "function" ? _ : constant(_);
      if (lineHeight === void 0) lineHeight = constant(Math.ceil(fontSize() * 1.1));
      return box;
    }
    return fontSize;
  };

  box.height = function(_) {
    return arguments.length ? (height = typeof _ === "function" ? _ : constant(_), box) : height;
  };

  box.id = function(_) {
    return arguments.length ? (id = typeof _ === "function" ? _ : constant(_), box) : id;
  };

  box.lineHeight = function(_) {
    return arguments.length ? (lineHeight = typeof _ === "function" ? _ : constant(_), box) : lineHeight;
  };

  box.resize = function(_) {
    return arguments.length ? (resize = _, box) : resize;
  };

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

  box.split = function(_) {
    return arguments.length ? (split = _, box) : split;
  };

  box.text = function(_) {
    return arguments.length ? (text = typeof _ === "function" ? _ : constant(_), box) : text;
  };

  box.textAnchor = function(_) {
    return arguments.length ? (textAnchor = typeof _ === "function" ? _ : constant(_), box) : textAnchor;
  };

  box.verticalAlign = function(_) {
    return arguments.length ? (verticalAlign = typeof _ === "function" ? _ : constant(_), box) : verticalAlign;
  };

  box.width = function(_) {
    return arguments.length ? (width = typeof _ === "function" ? _ : constant(_), box) : width;
  };

  box.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(_), box) : x;
  };

  box.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(_), box) : y;
  };

  return data.length ? box() : box;

}
