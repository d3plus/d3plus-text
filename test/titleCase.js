import zora from "zora";
import {default as titleCase} from "../src/titleCase.js";

export default zora()
  .test("titleCase", assert => {

    assert.equal(titleCase("this/that"), "This/That", "Non-space Break");
    assert.equal(titleCase("this and that"), "This and That", "Lowercase Word");
    assert.equal(titleCase("esto y aquello", {lng: "es-ES"}), "Esto y Aquello", "Parameter: lng");

  });
