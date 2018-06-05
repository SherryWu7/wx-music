// const formatTime = date => {
//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }

const formatTime = time => {
  if (typeof time !== 'number' || time < 0) {
    return time;
  }
  const hour = parseInt(time / 3600);
  time = time % 3600;
  const minute = parseInt(time / 60);
  time = time % 60
  const second = time;

  let list = [];
  if (hour) {
    list.push(hour);
  } 
  list.push(minute, second);

  return list.map(function (n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  }).join(':');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}
