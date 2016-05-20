import {default as stringify} from "./stringify";
import {default as combiningMarks} from "./combiningMarks";
import {merge} from "d3-array";

const splitChars = ["-",  "/",  ";",  ":",  "&",
                    "u0E2F",  // thai character pairannoi
                    "u0EAF",  // lao ellipsis
                    "u0ECC",  // lao cancellation mark
                    "u0EC6",  // lao ko la (word repetition)
                    "u104A",  // myanmar sign little section
                    "u104B",  // myanmar sign section
                    "u104D",  // myanmar symbol locative
                    "u104D",  // myanmar symbol completed
                    "u104F",  // myanmar symbol genitive
                    "u2013",  // en dash
                    "u2014",  // em dash
                    "u2027",  // simplified chinese hyphenation point
                    "u3000",  // simplified chinese ideographic space
                    "u3001",  // simplified chinese ideographic comma
                    "u3002",  // simplified chinese ideographic full stop
                    "uFF5E"  // wave dash
                  ];

const prefixChars = ["'",  "<",  "(",  "{",  "[",
                     "u00AB",  // left-pointing double angle quotation mark
                     "u300A",  // left double angle bracket
                     "u3008"  // left angle bracket
                   ];

const suffixChars = ["'",  ">",  ")",  "}",  "]",  ".",  "!",  "?",
                     "u00BB",  // right-pointing double angle quotation mark
                     "u300B",  // right double angle bracket
                     "u3009"  // right angle bracket
                   ].concat(splitChars);

const burmeseRange = "\u1000-\u102A\u103F-\u1055";
const japaneseRange = "\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u3400-\u4dbf";
const chineseRange = "\u3400-\u9FBF";
const laoRange = "\u0E80-\u0EFF";

const noSpaceRange = burmeseRange + chineseRange + laoRange;

const splitWords = new RegExp(`[^\\s\\${splitChars.join("|\\")}]+(\\${splitChars.join("|\\")})*`, "g");
const japaneseChars = new RegExp(`[${japaneseRange}]`);
const noSpaceLanguage = new RegExp(`[${noSpaceRange}]`);
const splitAllChars = new RegExp(`(\\${prefixChars.join("|\\")})*[${noSpaceRange}](\\${suffixChars.join("|\\")}|\\${combiningMarks.join("|\\")})*`, "g");

/**
    @function width
    @desc Splits a given sentence into an array of words.
    @param {String} sentence
*/
export default function(sentence) {
  if (!noSpaceLanguage.test(sentence)) return stringify(sentence).match(splitWords);
  return merge(stringify(sentence).match(splitWords).map((d) => {
    if (!japaneseChars.test(d) && noSpaceLanguage.test(d)) return d.match(splitAllChars);
    return [d];
  }));
}

export {prefixChars, splitChars, splitWords, suffixChars};
