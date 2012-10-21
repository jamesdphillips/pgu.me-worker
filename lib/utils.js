var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

exports.httpDate = function (now) {
  if (!now)
    now = new Date();

  function pad(val) {
    if (parseInt(val, 10) < 10)
      val = '0' + val;
    return val;
  }

  return DAYS[now.getUTCDay()] + ', ' +
    pad(now.getUTCDate()) + ' ' +
    MONTHS[now.getUTCMonth()] + ' ' +
    now.getUTCFullYear() + ' ' +
    pad(now.getUTCHours()) + ':' +
    pad(now.getUTCMinutes()) + ':' +
    pad(now.getUTCSeconds()) + ' GMT';
}