/**
 * Dependancies
 */

var gm = require('gm');


/**
 * Process Images
 */

exports = function (path, styles, cb) {
  var results = {};
  var completed = 0;
  var complete = function (err) {
    if (err) { completed = -1; cb(err); }
    else { completed++; }
    if (completed == styles.length) { cb(undefined, results); }
  }
  var resizeComplete = function (style) {
    return function (err, gm) {
        if (!err) {
        results[style] = gm;
        complete();
      } else { complete(err); }
    }
  }
  var convertedStyles = convertThumbStyles(styles);
  for (var i in convertedStyles) {
    var style = convertedStyles[i];
    switch (style.special) {
      case '#':
      case '!':
        resizeAbsolute(path, style, resizeComplete(style));
        break;
      case '>':
        shrinkToDimensions(path, style, resizeComplete(style));
        break;
      case '<':

        break;
      case '^':
      default:

        break;
    }
  }
}


/**
 * 
 */


/**
 * Get Image Size
 */

var getImageSize = function (file, cb) {
  gm(file).size(function(err, value) {
    if (!err && value.size) {
      cb(undefined, value.size);
    } else if (err) {
      cb(err);
    } else {
      cb(new Error('Unable to get dimensions of the given image.'));
    }
  });
}


/**
 * Resize absolute
 */ 

var resizeAbsolute = function (file, style, cb) {
  getImageSize(file, function (err, size) {
    if (!err) {
      var rect = { width: style.width, height: style.height };
      var cHeight = style.height;
      if ( size.width > style.width ) {
        rect.x = Math.floor((size.width - style.width) / 2.0);
      }
      else if ( size.width < style.width ) {
        rect.width = size.width;
        cHeight = size.width;
        rect.x = 0.0;
      }
      if ( size.height > cHeight ) {
        rect.y = Math.floor((size.height - style.height) / 2.0);
      }
      else if ( size.height < cHeight ) {
        rect.height = size.height;
        rect.width  = size.height;
        rect.y = 0.0;
        rect.x = Math.floor((size.width - style.height) / 2.0);
      }
      var f = gm(file).crop(rect.width, rect.height, rect.x, rect.y).resize(style.width, style.height);
      cb(undefined, f);
    }
    else { cb(err); }
  });
}


/**
 * Shrink image to dimensions
 */

var shrinkToDimensions = function (file, style, cb) {
  getImageSize(file, function (err, size) {
    if (!err) {
      var newSize = {};
      if (size.width > size.height) {
        if (size.width > style.width ) {
          newSize = { "width": style.width, "height": (size.height * (size.height/size.width))}
        }
        else if (size.height > style.height) {
          newSize = { "width": (size.width * (size.height/size.width)), "height": style.height}
        }
      }
      else {
        if (size.height > style.height) {
          newSize = { "width": (size.width * (size.width/size.height)), "height": style.height}
        }
        else if (size.width > style.width ) {
          newSize = { "width": style.width, "height": (size.height * (size.width/size.height))}
        }
      }
      var f = gm(file).resize(style.width, style.height);
      cb(undefined, f);
    }
    else { cb(err); }
  });
}


/**
 * Thumb Styles
 */

var convertThumbStyles = function (thumbStyles) {
  var parsedStyles = [];
  for (var name in thumbStyles) {
    var style = thumbStyles[name];
    var specialChars = [ '^', '!', '>', '<', '#' ];
    var specialChar = null;
    var width = null;
    var height = null;
    var xIndex = style.indexOf('x');
    if (xIndex >= 0) {
      width = style.substring(0, xIndex);
      var j = 1;
      var heightArray = [];
      while (style.charAt(xIndex + j) >= 0 && style.charAt(xIndex + j) < 10) {
        heightArray.push(style.charAt(xIndex + j)); 
        j++;
      }
      if (heightArray.length > 0) {
        height = 0;
        heightArray = heightArray.reverse();
        for (var i = 0; i < heightArray.length; i++) {
          height += (parseInt(heightArray[i]) * Math.pow(10,i));
        }
      }
    } else {
      var widthArray = [];
      var j = 0;
      while (style.charAt(j) >= 0 && style.charAt(j) < 10) {
        widthArray.push(style.charAt(j)); 
        j++;
      }
      if (widthArray.length > 0) {
        width = 0;
        widthArray = widthArray.reverse();
        for (var i = 0; i < widthArray.length; i++) {
          width += (parseInt(widthArray[i]) * Math.pow(10,i));
        }
      }
    }
    for (var j in specialChars) {
      var c = specialChars[j];
      if (style.indexOf(c) > 0) {
        specialChar = c;
        break;
      }
    }
    parsedStyles.push({
        name:     name
      , width:    width
      , height:   height
      , special:  specialChar
    });
  }
  return parsedStyles;
}
