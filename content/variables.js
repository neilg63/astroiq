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

vars.roddenOptions = [
  {value:"-", label: "Please select..",selected:true},
  {value:"AA1", label: "AA - Birth Certificate in hand",selected:false},
  {value:"AA2", label: "AA - Quoted Birth Record",selected:false},
  {value:"A1", label: "A - From memory",selected:false},
  {value:"A2", label: "A - News report",selected:false},
  {value:"B", label: "B - Bio/autobiography",selected:false},
  {value:"C1", label: "C - Accuracy in question",selected:false},
  {value:"C2", label: "C - Source not known",selected:false},
  {value:"C3", label: "C - Rectified from approx. time",selected:false},
  {value:"DD", label: "DD - Confliction/unverified",selected:false},
  {value:"X1", label: "X - Date without time of birth",selected:false},
  {value:"X2", label: "X - Rectified w/o time of birth",selected:false},
  {value:"XX1", label: "XX - Date in question",selected:false},
  {value:"XX2", label: "XX - Undetermioned",selected:false}
];

vars.houseSystems = [
   {value:"W", label: "Equal (Rāśi-Bhāva)",selected:true},
   {value:"E", label: "Equal (from ASC)",selected:false},
   {value:"D", label: "Equal (from MC)",selected:false},
   //- not in Swiss Ephemeris
   {value:"CB", label: "Caleta Bhāva",selected:false},
   {value:"S", label: "Śrīpati Bhāva",selected:false},
   {value:"O", label: "Porphyry",selected:false},
   {value:"P", label: "Placidus",selected:false},
   {value:"K", label: "Koch",selected:false},
   {value:"B", label: "Alcabitius",selected:false},
   {value:"C", label: "Campanus",selected:false},
   {value:"M", label: "Morinus",selected:false},
   {value:"R", label: "Regiomontanus",selected:false},
   {value:"T", label: "Topocentric",selected:false},
   {value:"A", label: "Equal",selected:false},
   {value:"X", label: "Meridian houses",selected:false},
   {value:"G", label: "36 Gauquelin sectors",selected:false},
   {value:"H", label: "Horizon / azimuth",selected:false}
];

vars.ayanamsas = [
  {value:"-", label: "Tropical / Sāyana",selected:true},
  {value:"1", label: "Lāhiḍī (Lahiri)",selected:false},
  {value:"3", label: "Rāman",selected:false},
  {value:"4", label: "Uśaśaśī",selected:false},
  {value:"5", label: "Krishnamurti",selected:false},
  {value:"7", label: "Yukteshwar",selected:false},
  {value:"8", label: "J.N. Bhasin",selected:false},
  {value:"21", label: "Sūrya Siddhānta",selected:false},
  {value:"22", label: "Sūrya Siddhānta, mean Sun",selected:false},
  {value:"25", label: "Sūrya Siddhānta Citrā",selected:false},
  {value:"26", label: "Sūrya Siddhānta Revatī",selected:false},
  {value:"23", label: "Āryabhaṭa",selected:false},
  {value:"27", label: "True Citrā",selected:false},
  {value:"28", label: "True Revatī",selected:false},
  {value:"29", label: "True Puṣya",selected:false},
  {value:"35", label: "True Mūla (Chandra Hari)",selected:false},
  {value:"36", label: "Dhruva/Mūla (E. Wilhelm)",selected:false},
  {value:"6", label: "Djwhal Khul",selected:false},
  {value:"0", label: "Fagan/Bradley",selected:false},
  {value:"2", label: "De Luce",selected:false},
  {value:"30", label: "Galactic (Gil Brand)",selected:false},
  {value:"34", label: "Skydram (Mardyks)",selected:false},
  {value:"15", label: "Hipparchos",selected:false},
  {value:"16", label: "Sassanian",selected:false}
];

vars.solarYearOptionNotes = `<p><strong>Tropical year</strong> (365.242199) is a measure of the Sun's passage from one mean vernal equinox to the next.</p>
<p>A <strong>Sidereal</strong> year (365.256366) is a measure of Earth's complete orbit around the Sun relative to fixed stars.</p>
<p>An <strong>Anomalistic</strong> year (365.259636) is a measure of earth's passage from one perihelion to another.</p>`;


vars.lunarMonthsNoteOptions = `<p> A <strong>Tropical</strong> month (27.321582) is a measure of the Moon's passage from one mean vernal equinox to the next.</p>
<p> A <strong>Sidereal</strong> month (27.321662) is a measure of Moon's complete orbit around the Earth relative to fixed stars.</p>
<p> An <strong>Anomalistic</strong> month (27.321582) is a measure of Moon's passage from one perihelion to another.</p>
<p> A <strong>Synodic</strong> month (29.530588) is a measure of Moon's passage from one New Moon to another.</p>`;
module.exports = vars;