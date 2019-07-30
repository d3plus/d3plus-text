import {test} from "zora";
import {trim, trimLeft, trimRight} from "../src/trim.js";

test("trim", assert => {

  assert.equal(trim("  word  "), "word", "trim");
  assert.equal(trimLeft("  word  "), "word  ", "trimLeft");
  assert.equal(trimRight("  word  "), "  word", "trimRight");
  assert.equal(trim(42), "42", "numeric");

});

export default test;
