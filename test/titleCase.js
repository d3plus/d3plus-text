import test from "zora";
import {default as titleCase} from "../src/titleCase.js";

test("titleCase", assert => {

  assert.equal(titleCase("this-that"), "This-That", "Non-space Break");
  assert.equal(titleCase("this and that"), "This and That", "Lowercase Word");

});

export default test;
