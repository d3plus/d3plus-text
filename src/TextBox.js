var d3 = require("d3-selection"),
    DataPoint = require("d3plus-datapoint"),
    Shell = require("d3plus-shell"),
    wrap = require("./wrap");

class TextBox extends Shell {

  constructor (data = []) {

    super();
    this.attr("resize", false);
    this.attr("x", 0);
    this.attr("y", 0);
    this.attr("width", 200);
    this.attr("height", 200);
    this.attr("font-size", 12);
    this.data(data);

  }

  data (arr) {

    if (!arguments.length) {
      return this.dataArray;
    }

    if (arr.constructor === String) {
      arr = d3.selectAll(arr);
    }

    if (arr instanceof d3.selection) {

      this.dataArray = [];
      this.attr("container", "container");
      this.attr("text", "text");

      var self = this;
      arr.each(function() {
        self.dataArray.push(new DataPoint({
          "container": this,
          "text": this.innerHTML
        }, self.settings));
      });

    }
    else {

      this.dataArray = arr.map(function(d) {
        return new DataPoint(d, this.settings);
      });

    }

    return this;

  }

  draw (timing) {

    if (arguments.length) {
      this.timing = timing;
    }

    for (let text of this.dataArray) {
      wrap(text);
    }

    return this;

  }

}

module.exports = TextBox;
