import test from "zora";
import {default as textWrap} from "../src/textWrap.js";

test("textWrap", assert => {

  const font = "Verdana";

  const sentence = "Hello D3plus, please wrap this sentence for me.",
        testWrap = textWrap().fontFamily(font).fontSize(14)(sentence);

  assert.ok(testWrap.lines[0] === "Hello D3plus, please wrap" &&
            testWrap.lines[1] === "this sentence for me.", "returning wrapped lines");
  assert.equal(testWrap.sentence, "Hello D3plus, please wrap this sentence for me.", "returning original sentence");
  assert.equal(testWrap.truncated, false, "returning truncated boolean");

  const spaceTest = "Two  Space Test",
        spaceWrap = textWrap().fontFamily(font).fontSize(14)(spaceTest);
  assert.equal(spaceWrap.lines[0], spaceTest, "catch for multiple spaces");

  assert.equal(textWrap()("A\nB").lines[0], "A", "catch for literal line break (\\n)");

});

export default test;
