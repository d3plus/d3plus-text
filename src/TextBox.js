var d3 = require("d3-selection"),
    DataPoint = require("d3plus-datapoint"),
    Shell = require("d3plus-shell");

class TextBox extends Shell {

  constructor (data = []) {

    super();
    this.settings.set("resize", false);
    this.settings.set("x", 0);
    this.settings.set("y", 0);
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
      var self = this;
      arr.each(function() {
        self.dataArray.push(new DataPoint(this, self.settings));
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

    return this;

  }

}

module.exports = TextBox;
