import {test} from "zora";
import {default as strip} from "../src/strip.js";

test("strip", assert => {

  assert.equal(strip("one two"), "one-two", "Strips Spaces");
  assert.equal(strip("one two", " "), "one two", "Changes Spacer Argument");
  assert.equal(strip("one@two"), "onetwo", "Strips Non-character");
  assert.equal(strip("á"), "a", "Strips Diacritic");
  assert.equal(strip("والاجتماعية"), "والاجتماعية", "Keeps Arabic");

});

export default test;
