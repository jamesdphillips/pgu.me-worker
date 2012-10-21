
var resque = require('coffee-resque').connect({
  host: '127.0.0.1'
, port: 6379
});
var jobs = require('./jobs');

console.log(jobs);
