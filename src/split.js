const splitChars = ["-", "/", ";", ":", "&"],
      splitRegex = new RegExp(`[^\\s\\${splitChars.join("\\")}]+\\${splitChars.join("?\\")}?`, "g");

/**
    @function width
    @desc Splits a given sentence into an array of words.
    @param {String} sentence
*/
export default function(sentence) {
  return sentence.match(splitRegex);
}

export {splitChars, splitRegex};
