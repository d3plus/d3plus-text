import {test} from "tape";
import {default as strip} from "../src/strip.js";

test("strip", assert => {

  assert.equal(strip("one two"), "one-two", "Space");
  assert.equal(strip("one@two"), "onetwo", "Removed");
  assert.equal(strip("á"), "a", "Diacritic");

  assert.end();

});
