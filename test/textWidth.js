import {test} from "tape";
import {default as textWidth} from "../src/textWidth.js";

test("textWidth", assert => {

  const base = textWidth("Test", {"font-family": "Verdana", "font-size": 14}),
        bigger = textWidth("Test", {"font-family": "Verdana", "font-size": 28}),
        bolder = textWidth("Test", {"font-family": "Verdana", "font-size": 14, "font-weight": "bold"}),
        longer = textWidth("TestTest", {"font-family": "Verdana", "font-size": 14});

  assert.true(base * 2 === longer, "string length");
  assert.true(base < bigger, "font-size");
  assert.true(base < bolder, "font-weight");

  assert.end();

});
