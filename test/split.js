import {test} from "tape";
import {default as split, splitChars} from "../src/split.js";

test("split", assert => {

  for (let i = 0; i < splitChars.length; i++) {
    let char = splitChars[i];
    if (char.startsWith("u")) char = String.fromCharCode(`0x${char.slice(1)}`);
    const sentence = `test${char}test`;
    const arr = split(sentence);
    const first = char === " " ? "test" : `test${char}`;
    assert.true(arr[0] === first && arr[1] === "test", `using "${char}"`);
  }

  const chinese = split("里句。");
  assert.true(chinese[0] === "里" && chinese[1] === "句。", "simplified chinese");

  const burmese = split("ကြောယ်။");
  assert.true(burmese[0] === "ကြော" && burmese[1] === "ယ်။", "burmese");

  const lao = split("ຕໍ່ດ້.");
  assert.true(lao[0] === "ຕໍ່" && lao[1] === "ດ້.", "lao");

  assert.end();

});
