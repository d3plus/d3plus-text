import {test} from "tape";
import {default as wrap} from "../src/wrap.js";

test("wrap", assert => {

  const sentence = "Hello D3plus, please wrap this sentence for me.",
        testWrap = wrap()
          .fontFamily("Verdana").fontSize(14)
          (sentence);

  assert.true(testWrap.lines[0] === "Hello D3plus, please wrap" &&
              testWrap.lines[1] === "this sentence for me.", "returning wrapped lines");
  assert.equal(testWrap.sentence, "Hello D3plus, please wrap this sentence for me.", "returning original sentence");
  assert.equal(testWrap.truncated, false, "returning truncated boolean");

  assert.end();

});
