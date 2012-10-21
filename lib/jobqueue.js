
exports.redis = {};

/**
 * add
 * Description: Add job to the queue
 * Parameters:
 *   type:   class of object
 *   id:     unqiue identifier for the object
 *   method: method to run on object
 */

exports.add = function (type, id, method, cb) {
  exports.redis.rpush('pgu.jobs.' + type, {
      id      : id
    , method  : method
  }, function (err, res) {
    if (err && cb) cb(err);
    else if (cb) cb();
  });
}


/**
 * getJobForType
 * Description: Gets the oldest job in the queue for given type
 * Parameters:
 *   type: type of object we want
 *   cb:   callback
 */

exports.getJobForType = function (type, cb) {
  exports.redis.blpop('pgu.jobs.' + type, function (err, job) {
    if (!err && job) {
      try {
        job = JSON.parse(job);
      } catch (err) {
        return cb(err);
      }
      cb(undefined, job);
    } else if (err) {
      cb(err);
    } else {
      cb(new Error('Unknown Error: Trying to grab job of type ' + type));
    }
  });
}