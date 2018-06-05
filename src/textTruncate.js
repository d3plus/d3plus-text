import measure from "./textWidth";

/**
    @function textTruncate
    @desc Truncate a single word with ellipsis until if fits within the given width
    @param  {String} text     The word to truncate
    @param  {String} ellipsis The ellipsis to append
    @param  {Number} maxWidth The maximum width that the text can take
    @param  {Object} style    The style object to apply
    @return {String}          The resultant text with ellipsis
 */
export default function(text, ellipsis, maxWidth, style) {
  for (let i = text.length; i > 0; i--) {
    const shortened = text.slice(0, i) + ellipsis;
    const width = measure(shortened, style);
    if (width < maxWidth) {
      return shortened;
    }
  }

  return ellipsis;
}
