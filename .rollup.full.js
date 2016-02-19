import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json";
import npm from "rollup-plugin-npm";

export default {
  dest: "build/d3plus-text.full.js",
  entry: "index.js",
  format: "umd",
  globals: function(id) { return id.replace(/-/g, "_"); },
  moduleId: "d3plus-text",
  moduleName: "d3plus_text",
  plugins: [
    json(),
    npm({"jsnext": true, "main": true}),
    babel({"presets": ["es2015-rollup"]})
  ]
};
