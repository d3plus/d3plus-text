import {default as d3} from "d3";

/**
    @function width
    @desc Given a text string, returns the predicted pixel width of the string when placed into DOM.
    @param {String|Array} text Can be either a single string or an array of strings to analyze.
    @param {Object} [style] An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values.
*/
export default function(text, style = {"font-size": 10, "font-family": "sans-serif"}) {

  const canvas = d3.select("body").selectAll("canvas#d3plus-text-size").data([0]);
  canvas.enter().append("canvas")
    .attr("id", "d3plus-text-size")
    .style("position", "absolute")
    .style("left", "-9999px")
    .style("top", "-9999px")
    .style("visibility", "hidden")
    .style("display", "block");
  const context = canvas.node().getContext("2d");

  const font = [];
  if ("font-style" in style) font.push(style["font-style"]);
  if ("font-variant" in style) font.push(style["font-variant"]);
  if ("font-weight" in style) font.push(style["font-weight"]);
  if ("font-size" in style) {
    let s = `${style["font-size"]}px`;
    if ("line-height" in style) s += `/${style["line-height"]}px`;
    font.push(s);
  }
  if ("font-family" in style) font.push(style["font-family"]);

  context.font = font.join(" ");

  if (text instanceof Array) return text.map((t) => context.measureText(t).width);
  return context.measureText(text).width;

}
