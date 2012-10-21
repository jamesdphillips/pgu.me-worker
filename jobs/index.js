var fs = require('fs');
fs.readdirSync(__dirname).forEach(function(file) {
  if (file.slice(-3) == '.js') {
    var name = file.substr(0, file.lastIndexOf('.'));
    if ( name != 'index' ) {
      exports[name] = require(__dirname + '/' + name + '.js');
    }
  }
});
