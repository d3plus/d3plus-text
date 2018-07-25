import test from "zora";
import {default as textWidth} from "../src/textWidth.js";

test("textWidth", assert => {

  const font = "Verdana";

  const base = textWidth("Test", {"font-family": font, "font-size": 14}),
        bigger = textWidth("Test", {"font-family": font, "font-size": 28}),
        bolder = textWidth("Test", {"font-family": font, "font-size": 14, "font-weight": "bold"}),
        longer = textWidth("TestTest", {"font-family": font, "font-size": 14});

  assert.ok(base * 2 === longer, "string length");
  assert.ok(base < bigger, "font-size");
  assert.ok(base < bolder, "font-weight");

});

export default test;
