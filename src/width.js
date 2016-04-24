/**
    @function width
    @desc Given a text string, returns the predicted pixel width of the string when placed into DOM.
    @param {String|Array} text Can be either a single string or an array of strings to analyze.
    @param {Object} [style] An object of CSS font styles to apply. Accepts any of the valid [CSS font property](http://www.w3schools.com/cssref/pr_font_font.asp) values.
*/
export default function(text, style = {"font-size": 10, "font-family": "sans-serif"}) {

  const context = document.createElement("canvas").getContext("2d");

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
