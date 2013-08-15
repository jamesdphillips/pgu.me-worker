var thumbnail = require('../lib/thumbnail');
var crypto = require('crypto');
var async = require('async');
var knox = require('knox');
var fs = require('fs');

module.exports = function (config) {
  var client = knox.createClient({
      key:    config.s3.key
    , secret: config.s3.secret
    , bucket: config.s3.bucket
  });
  var thumbnailTypes = {
    'm': '200x200>',
    's': {
      size:   '80x80!',
      format: 'png' },
    'l': {
      size:   '500x500>',
      format: 'jpg',
      quality: 80 }
  };
  var uploadConvertedFile = function (style, cb) {
    crypto.randomBytes(48, function (ex, buffer) {
      var key = buffer.toString('hex');
      var tmpfile = '/tmp' + '/' + key;
      style.file.write(tmpfile, function (err) {
        if (!err) {
          client.putFile(key, tmpfile, function(err, res) {
            fs.unlink(tmpfile);
            style.key = key;
            cb(undefined, style);
          });
        } else { cb(err); }
      });
    });
  }
  var grabFile = function (token, cb) {
    var filename = crypto.randomBytes(48).toString('hex');
    var filepath = '/tmp' + '/' + filename;
    var fileStream = fs.createWriteStream(filepath);
    fileStream.on('close', function () {
      cb(undefined, filepath);
    });
    fileStream.on('error', cb);
    client.getFile(('/' + token), function (err, res) {
      if (res.statusCode == 200) {
        res.pipe(fileStream);
      } else if (err) {
        cb(err)
      } else {
        cb(new Error('Could not find image on S3 bucket.'));
      }
    });
  }
  return function (token, cb) {
    grabFile(token, function (err, filepath) {
      thumbnail(filepath, thumbnailTypes, function (err, styles) {
        if (!err && styles) {
          async.map(styles, uploadConvertedFile, function (err, styles) {
            // Delete tmp file
            fs.unlink(filepath);
            // TODO: Update image in backend.
            cb(new Error('So far so good.'));
          });
        } else {
          cb(err || new Error('No processed styles were returned.'));
        }
      });
    });
  }
};