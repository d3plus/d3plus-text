import {test} from "tape";
import {default as width} from "../src/width.js";

test("width", assert => {

  const base = width("Test", {"font-family": "Verdana", "font-size": 14}),
        bigger = width("Test", {"font-family": "Verdana", "font-size": 28}),
        bolder = width("Test", {"font-family": "Verdana", "font-size": 14, "font-weight": "bold"}),
        longer = width("TestTest", {"font-family": "Verdana", "font-size": 14});

  assert.true(base * 2 === longer, "string length");
  assert.true(base < bigger, "font-size");
  assert.true(base < bolder, "font-weight");

  assert.end();

});
