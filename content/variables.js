const fs = require('fs');
const filter = require('./filter-funcs.js');
const timezones = require('./timezones.js');
const config = require('./../server/config/config.js');

var vars = {};

vars.title = "AstroIQ Demo";

vars.timezone = {
	offsets: filter.generateTimeZoneOffsets(),
  ds_options: filter.generateSummerTimeOffsets()
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
   //{value:"CB", label: "Caleta Bhāva",selected:false},
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
 /* {value:"27", label: "True Citrā",selected:false},
  {value:"28", label: "True Revatī",selected:false},
  {value:"29", label: "True Puṣya",selected:false},
  {value:"35", label: "True Mūla (Chandra Hari)",selected:false},
  {value:"36", label: "Dhruva/Mūla (E. Wilhelm)",selected:false},*/
  {value:"6", label: "Djwhal Khul",selected:false},
  {value:"0", label: "Fagan/Bradley",selected:false},
  {value:"2", label: "De Luce",selected:false},
  {value:"30", label: "Galactic (Gil Brand)",selected:false},
  {value:"34", label: "Skydram (Mardyks)",selected:false},
  {value:"15", label: "Hipparchos",selected:false},
  {value:"16", label: "Sassanian",selected:false}
];

vars.chartTypes = [
  {value:"birth", label: "Birth",selected:true},
  {value:"event", label: "Event",selected:false},
  {value:"question", label: "Question",selected:false},
  {value:"electional", label: "Electional",selected:false}
];

vars.eventTypes = [
  {value:"education-start-school", label: "Start school",selected:false},
  {value:"education-gain-degree", label: "Graduate (Degree)",selected:false},
  {value:"relationship-start", label: "Start relationship",selected:false},
  {value:"relationship-marriage", label: "Marriage",selected:false},
  {value:"relationship-separation", label: "Separation",selected:false},
  {value:"relationship-divorce", label: "Divorce",selected:false},
  {value:"birth-son", label: "Childbirth (son)",selected:false},
  {value:"birth-daughter", label: "Childbirth (daughter)",selected:false},
  {value:"birth-sibling", label: "Birth of a sibling",selected:false},
  {value:"life-success-job-start-new", label: "Start job",selected:false},
  {value:"life-success-job-promotion", label: "Job promotion",selected:false},
  {value:"life-success-job-success", label: "Job success",selected:false},
  {value:"life-success-great win", label: "Great win",selected:false},
  {value:"health-accident", label: "Accident",selected:false},
  {value:"health-illness", label: "Illness",selected:false},
  {value:"health-hospitalization", label: "Hospitalization",selected:false},
  {value:"journey-long", label: "Long journey",selected:false},
  {value:"journey-short", label: "Short journey",selected:false},
  {value:"journey-relocation", label: "Relocation",selected:false},
  {value:"death-close-relative", label: "Death of a close relative",selected:false},
  {value:"death-mother", label: "Death of mother",selected:false},
  {value:"death-father", label: "Death of father",selected:false},
  {value:"death-self", label: "Death of self",selected:false}
];

vars.solarYearOptionNotes = filter.getHtml('solarYearOptionNotes');

vars.lunarMonthsNoteOptions = filter.getHtml('lunarMonthsNoteOptions');

vars.google = {
  map_apikey: config.google.map_apikey
};

module.exports = vars;