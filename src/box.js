import {select as d3} from "d3-selection";
import {default as constant} from "./constant";

/**
    The default ellipsis function.
    @private
*/
function boxEllipsis(_) {
  if (_.includes(" ")) {
    const a = _.split(/\s+/);
    return _.replace(` ${a[a.length - 1]}`, "...");
  }
  return "...";
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

export default function() {

  let ellipsis = boxEllipsis,
      fontColor,
      fontFamily,
      fontSize,
      height = constant(200),
      lineHeight,
      select,
      split = boxSplit,
      text,
      width = constant(200),
      x = constant(0),
      y = constant(0);

  function box() {

    const fS = fontSize(),
          h = height(select),
          lH = lineHeight(),
          t = text(select),
          w = width(select),
          xP = x(select);

    let l = 1,
        p = "";

    select
      .attr("y", `${y(select)}px`)
      .attr("fill", fontColor())
      .attr("font-family", fontFamily())
      .attr("font-size", `${fS}px`)
      .size("font-size", `${fS}px`);

    function tspanStyle(tspan) {
      tspan
        .attr("x", `${xP}px`)
        .attr("dx", "0px")
        .attr("dy", `${lH}px`)
        .attr("dominant-baseline", "alphabetic")
        .style("baseline-shift", "0%");
    }

    let tspan = select.html("").append("tspan").call(tspanStyle);
    function addWord(word) {
      const curr = tspan.html(),
            temp = p + word;
      const join = t.charAt(temp.length);
      tspan.html(curr + word);

      if (select.node().getBBox().height > h) {
        tspan.remove();
        tspan = d3(select.node().lastChild);
        if (tspan.size()) {
          const tl = tspan.html();
          const e = ellipsis(tl);
          tspan.html(e ? e : tl);
        }
        return false;
      }
      else if (tspan.node().getComputedTextLength() > w) {
        tspan.html(curr.trimRight());
        if (l === 1 && curr === "") return false;
        tspan = select.append("tspan").call(tspanStyle);
        l++;
        return addWord(word);
      }
      else {
        const char = join === " " ? " " : "";
        p = temp + char;
        tspan.html(curr + word + char);
        return true;
      }
    }

    for (const word of split(t)) {
      const r = addWord(word);
      if (!r) break;
    }

  }

  box.ellipsis = function(_) {
    return arguments.length ? (ellipsis = typeof _ === "function" ? _ : constant(_), box) : ellipsis;
  };

  box.fontColor = function(_) {
    return arguments.length ? (fontColor = typeof _ === "function" ? _ : constant(_), box) : fontColor;
  };

  box.fontFamily = function(_) {
    return arguments.length ? (fontFamily = typeof _ === "function" ? _ : constant(_), box) : fontFamily;
  };

  box.fontSize = function(_) {
    if (arguments.length) {
      fontSize = typeof _ === "function" ? _ : constant(_);
      if (lineHeight === void 0) lineHeight = constant(Math.ceil(fontSize() * 1.1));
    }
    return fontSize;
  };

  box.height = function(_) {
    return arguments.length ? (height = typeof _ === "function" ? _ : constant(_), box) : height;
  };

  box.lineHeight = function(_) {
    return arguments.length ? (lineHeight = typeof _ === "function" ? _ : constant(_), box) : lineHeight;
  };

  box.select = function(_) {
    if (arguments.length) {
      select = d3(_);
      if (text === void 0) {
        text = constant(select.text());
        if (fontColor === void 0) box.fontColor(select.style("font-color"));
        if (fontFamily === void 0) box.fontFamily(select.style("font-family"));
        if (fontSize === void 0) box.fontSize(parseFloat(select.style("font-size"), 10));
      }
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

  box.width = function(_) {
    return arguments.length ? (width = typeof _ === "function" ? _ : constant(_), box) : width;
  };

  box.x = function(_) {
    return arguments.length ? (x = typeof _ === "function" ? _ : constant(_), box) : x;
  };

  box.y = function(_) {
    return arguments.length ? (y = typeof _ === "function" ? _ : constant(_), box) : y;
  };

  return box;

}
