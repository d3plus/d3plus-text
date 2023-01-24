import assert from "assert";
import {default as strip} from "../src/strip.js";

it("strip", () => {

  assert.strictEqual(strip("one two"), "one-two", "Space");
  assert.strictEqual(strip("one@two"), "onetwo", "Removed");
  assert.strictEqual(strip("á"), "a", "Diacritic");

});
