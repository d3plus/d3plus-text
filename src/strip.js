const removed = [
  "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "[", "]", "{", "}", ".",
  ", ", "/", "\\", "|", "'", "\"", ";", ":", "<", ">", "?", "=", "+"];

const diacritics = [
  [/[\300-\306]/g, "A"], [/[\340-\346]/g, "a"],
  [/[\310-\313]/g, "E"], [/[\350-\353]/g, "e"],
  [/[\314-\317]/g, "I"], [/[\354-\357]/g, "i"],
  [/[\322-\330]/g, "O"], [/[\362-\370]/g, "o"],
  [/[\331-\334]/g, "U"], [/[\371-\374]/g, "u"],
  [/[\321]/g, "N"], [/[\361]/g, "n"],
  [/[\307]/g, "C"], [/[\347]/g, "c"]
];

/**
    @function strip
    @desc Removes all non ASCII characters from a string.
    @param {String} value
*/
export default function(value) {

  return `${value}`.replace(/[^A-Za-z0-9\-_]/g, char => {

    if (char === " ") return "-";
    else if (removed.indexOf(char) >= 0) return "";

    for (let d = 0; d < diacritics.length; d++) {
      if (new RegExp(diacritics[d][0]).test(char)) {
        char = diacritics[d][1];
        break;
      }
    }

    return char;

  });
}
