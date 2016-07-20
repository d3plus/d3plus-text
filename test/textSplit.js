import {test} from "tape";
import {default as textSplit, splitChars} from "../src/textSplit.js";

test("textSplit", assert => {

  for (let i = 0; i < splitChars.length; i++) {
    let char = splitChars[i];
    if (char.startsWith("u")) char = String.fromCharCode(`0x${char.slice(1)}`);
    const sentence = `test${char}test`;
    const arr = textSplit(sentence);
    const first = char === " " ? "test" : `test${char}`;
    assert.true(arr[0] === first && arr[1] === "test", `using "${char}"`);
  }

  const chinese = textSplit("里句。");
  assert.true(chinese[0] === "里" && chinese[1] === "句。", "simplified chinese");

  const burmese = textSplit("ကြောယ်။");
  assert.true(burmese[0] === "ကြော" && burmese[1] === "ယ်။", "burmese");

  const lao = textSplit("ຕໍ່ດ້.");
  assert.true(lao[0] === "ຕໍ່" && lao[1] === "ດ້.", "lao");

  assert.end();

});
