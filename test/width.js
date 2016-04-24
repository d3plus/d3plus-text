import {test} from "tape";
import {default as width} from "../src/width.js";

test("width", (assert) => {

  assert.equal(width("Test Text", {"font-family": "Verdana", "font-size": 14}), 65.4677734375, "small");
  assert.equal(width("Test Text", {"font-family": "Verdana", "font-size": 28}), 130.935546875, "large");
  assert.equal(width("Test Text", {"font-family": "Verdana", "font-size": 14, "font-weight": "bold"}), 72.8916015625, "bold");
  assert.end();

});
