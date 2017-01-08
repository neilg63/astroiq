const timezones = require('./timezones.js');

var timeStrToMinutes = (str) => {
  var v = str.replace('+',''),
  parts = v.split(':'),
  h = parseInt(parts[0]),
  m = h * 60;
  if (parts.length>1) {
    var mv = parseInt(parts[1]);
    if (h <0) {
      m += mv;
    } else {
      m -= mv;
    }
  }
  return m;
}

var filterTimeZoneOffsets = () => {
  var i = 0, len=timezones.length,data=[],offsets=[],index,row,m;
  for (;i<len;i++) {
    row = timezones[i];
    if (/(Summer|Dayl)/i.test(row.title) == false) {
      m = timeStrToMinutes(row.offset);
      index = offsets.indexOf(m);
      if (offsets.indexOf(m) < 0) {
        data.push({
          minutes: m,
          value: row.offset,
          abbrevs: [row.code]
        });
        offsets.push(m);
      } else {
        data[index].abbrevs.push(row.code);
      }
      
    }
  }
  data = data.sort((a, b) => a.minutes - b.minutes);
  return data;
}


var generateTimeZoneOffsets = () => {
  var data = filterTimeZoneOffsets(),opts=[],row,selected;
	for (var k in data) {
    row = data[k];
    opts.push({
      value: row.value,
      label: row.value,
      selected: row.minutes == 0
    });
  }
	return opts;
}

var generateSummerTimeOffsets = () => {
  var s = -4, e = 4,def = 0,opts=[],str;
  for (;s<e;s++) {
    str = '';
    dh = Math.abs(s/2);
    if (s<0) {
      str += '-';
    } else if (s > 0) {
       str += '+';
    }
    str += parseInt(dh);
    opts.push({
      value: str,
      label: str + ' hrs',
      selected: s === 0
    });
  }
  return opts;
};

var vars = {};

vars.title = "AstroIQ Demo";

vars.timezone = {
	offsets: generateTimeZoneOffsets(),
  ds_options: generateSummerTimeOffsets()
};



module.exports = vars;