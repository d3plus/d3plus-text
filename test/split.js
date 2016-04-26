import {test} from "tape";
import {default as split, splitChars} from "../src/split.js";

test("split", (assert) => {

  for (let i = 0; i < splitChars.length; i++) {
    const char = splitChars[i];
    const arr = split(`test${char}test`);
    const first = char === " " ? "test" : `test${char}`;
    assert.true(arr[0] === first && arr[1] === "test", `split using "${char}"`);
  }

  assert.end();

});
