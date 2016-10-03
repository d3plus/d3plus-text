import {locale} from "d3plus-common";

import {suffixChars, default as textSplit} from "./textSplit";

/**
    @function titleCase
    @desc Capitalizes the first letter of each word in a phrase/sentence.
    @param {String} str The string to apply the title case logic.
    @param {Object} [opts] Optional parameters to apply.
    @param {String} [opts.lng] The locale to use when looking up all lowercase or uppecase words.
*/
export default function(str, opts) {

  if (str === void 0) return "";

  opts = Object.assign({
    lng: "en-US"
  }, opts);

  const {lng} = opts;

  const smalls = locale.t("array.lowercase", {lng, returnObjects: true}).map(s =>  s.toLowerCase());

  let bigs = locale.t("array.uppercase", {lng, returnObjects: true});
  bigs = bigs.concat(bigs.map(b => `${b}s`));
  const biglow = bigs.map(b => b.toLowerCase());

  const split = textSplit(str);
  return split.map((s, i) => {
    if (s) {
      const lower = s.toLowerCase();
      const stripped = suffixChars.includes(lower.charAt(lower.length - 1)) ? lower.slice(0, -1) : lower;
      const bigindex = biglow.indexOf(stripped);
      if (bigindex >= 0) return bigs[bigindex];
      else if (smalls.includes(stripped) && i !== 0 && i !== split.length - 1) return lower;
      else return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
    }
    else return "";
  }).reduce((ret, s, i) => {
    if (i && str.charAt(ret.length) === " ") ret += " ";
    ret += s;
    return ret;
  }, "");

}
