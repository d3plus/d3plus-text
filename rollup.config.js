import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";

export default {
  dest: "build/d3plus-text.js",
  entry: "index.js",
  format: "umd",
  globals: function(id) { return id.replace(/-/g, "_"); },
  moduleId: "d3plus-text",
  moduleName: "d3plus_text",
  plugins: [json(), babel()]
};
