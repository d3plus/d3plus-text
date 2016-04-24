import buble from "rollup-plugin-buble";
import json from "rollup-plugin-json";
import deps from "rollup-plugin-node-resolve";

export default {
  dest: "build/d3plus-text.full.js",
  entry: "index.js",
  format: "umd",
  globals: function(id) { return id.replace(/-/g, "_"); },
  moduleId: "d3plus-text",
  moduleName: "d3plus_text",
  plugins: [json(), deps({"jsnext": true, "main": true}), buble()]
};
