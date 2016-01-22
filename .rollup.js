import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json";

export default {
  dest: "build/d3plus-text.js",
  entry: "index.js",
  format: "umd",
  globals: function(id) { return id.replace(/-/g, "_"); },
  moduleId: "d3plus-text",
  moduleName: "d3plus_text",
  plugins: [
    json(),
    babel({"presets": ["es2015-rollup"]})
  ]
};
