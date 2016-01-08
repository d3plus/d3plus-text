module.exports = function(data) {

  var words = data.fetch("text").split(/\s+/);

  console.log(words);

};
