import test from "zora";
import {default as fontExists} from "../src/fontExists.js";

test("fontExists", assert => {

  const missing = "Missing", valid = "Verdana";

  assert.equal(valid, fontExists(valid), "single - exists");
  assert.equal(false, fontExists(missing), "single - missing");
  assert.equal(valid, fontExists(`${valid}, ${missing}`), "string - first");
  assert.equal(valid, fontExists(`${missing}, ${valid}`), "string - second");
  assert.equal(false, fontExists(`${missing}, ${missing}2`), "string - none");
  assert.equal(valid, fontExists([valid, missing]), "array - first");
  assert.equal(valid, fontExists([missing, valid]), "array - second");
  assert.equal(false, fontExists([missing, `${missing}2`]), "array - none");

});

export default test;
