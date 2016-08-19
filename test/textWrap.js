import {test} from "tape";
import {default as textWrap} from "../src/textWrap.js";

test("textWrap", assert => {

  const sentence = "Hello D3plus, please wrap this sentence for me.",
        testWrap = textWrap().fontSize(14)(sentence);

  assert.true(testWrap.lines[0] === "Hello D3plus, please wrap this" &&
              testWrap.lines[1] === "sentence for me.", "returning wrapped lines");
  assert.equal(testWrap.sentence, "Hello D3plus, please wrap this sentence for me.", "returning original sentence");
  assert.equal(testWrap.truncated, false, "returning truncated boolean");

  assert.end();

});
