import {test} from "tape";
import {default as split, splitChars} from "../src/split.js";

test("split", (assert) => {

  for (let i = 0; i < splitChars.length; i++) {
    let char = splitChars[i];
    if (char.startsWith("u")) char = String.fromCharCode(`0x${char.slice(1)}`);
    const sentence = `test${char}test`;
    const arr = split(sentence);
    const first = char === " " ? "test" : `test${char}`;
    assert.true(arr[0] === first && arr[1] === "test", `split using "${char}"`);
  }

  assert.end();

});
