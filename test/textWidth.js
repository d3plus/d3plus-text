import zora from "zora";
import {default as textWidth} from "../src/textWidth.js";

export default zora()
  .test("textWidth", assert => {

    const base = textWidth("Test", {"font-family": "Verdana", "font-size": 14}),
          bigger = textWidth("Test", {"font-family": "Verdana", "font-size": 28}),
          bolder = textWidth("Test", {"font-family": "Verdana", "font-size": 14, "font-weight": "bold"}),
          longer = textWidth("TestTest", {"font-family": "Verdana", "font-size": 14});

    assert.ok(base * 2 === longer, "string length");
    assert.ok(base < bigger, "font-size");
    assert.ok(base < bolder, "font-weight");

  });
