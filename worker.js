var jobs = require('./jobs')
  , yaml = require('js-yaml')
  , config = require('./config.yml')

/**
 * pgu.me Worker 
 */

var resque = require('coffee-resque').connect(config.redis);
var worker = resque.worker('pgu', jobs(config));
var airbrake = require('airbrake').createClient(config.airbrake.key);

worker.on('error', function (err, job, queue) {
  // if (process.env['NODE_ENV'] == 'production') {
    err.message = 'Job in queue "' + queue + '" encountered error: "' + err.message +'"'
    airbrake.notify(err, function (err, url) {
      console.log(err, url);
      console.log(config.airbrake.key);
    });
  // } else {
    process.stderr.write('===\n');
    process.stderr.write('Job in queue "' + queue + '" encountered an error.\n');
    process.stderr.write(err.stack.toString() + '\n');
    process.stderr.write('===\n');
  // }
});

process.on('SIGINT', function () {
  console.log('Stopping worker..');
  worker.end(function () {
    process.exit();
  });
});

worker.start();
