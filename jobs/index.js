var fs = require('fs');

module.exports = function (config) {
  var methods = {};
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file.slice(-3) == '.js') {
      var name = file.substr(0, file.lastIndexOf('.'));
      if ( name != 'index' ) {
        var job = require(__dirname + '/' + name + '.js')
        methods[name] = job(config);
      }
    }
  });
  return methods;
}
