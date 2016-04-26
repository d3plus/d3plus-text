import {test} from "tape";
import {default as stringify} from "../src/stringify.js";

test("stringify", (assert) => {

  assert.equal(stringify(true), "true");
  assert.equal(stringify(false), "false");
  assert.equal(stringify(undefined), "undefined");
  assert.equal(stringify(42), "42", "integer");
  assert.equal(stringify(3.14159265), "3.14159265", "float");
  assert.equal(stringify("string"), "string");

  assert.end();

});
