const moment = require('moment');
const textutils = require('./text-utils.js');
const timezone = require('./../geocode/timezone.js');

function isNumeric(scalarVal) {
  switch (typeof scalarVal) {
    case 'number':
      return !isNaN(scalarVal);
    case 'string':
    return scalarVal.isNumeric();
  }
}

function isString(scalarVal) {
  return typeof scalarVal == 'string';
}

function isArray(arrVal) {
  return typeof arrVal == 'object' && arrVal instanceof Array;
}

function isObject(arrVal) {
  return typeof arrVal == 'object';
}

var conversions = {

	isCoords: (strVal) => {
		return /^\s*-?\d?\d(\.\d+)?\s*,\s*-?[01]?\d?\d(\.\d+)?\s*$/.test(strVal);
	},

	strToLatLng: (str) => {
		var parts = [];
		if (typeof str == 'string') {
			parts = str.split(',');
		}
		return conversions.arrayToLatLng(parts);
	},

	arrayToLatLng: (arrCoords) => {
		let obj = {lat:null,lng:null};
		if (arrCoords instanceof Array) {
			if (arrCoords.length > 1) {
				if (isNumeric(arrCoords[0]) && isNumeric(arrCoords[1])) {
					obj.lat = parseFloat(arrCoords[0]);
					obj.lng = parseFloat(arrCoords[1]);
				}
			}
		}
		return obj;
	},

	coordsToStr: (coords) => {
		var parts = [];
		if (isObject(coords)) {
			if (!isArray(coords)) {
				if (isNumeric(coords.lat)) {
					parts = [coords.lat,coords.lng];
				}
			} else {
				parts = coords;
			}
			return parts.join(',');
		}
	},

	euroDatePartsToISOString: (date,time) =>{
		if (isString(date) && isString(time)) {
			var ds = date.split('.').reverse().join('-'),
				tp = time.split('.'), mins;
			if (tp.length>1) {
				mins = tp[1];
				if (mins.length>2) {
					tp[1] = mins.substring(0,2);
					tp.push(mins.substring(2));
				}
			}
			if (tp.length < 3) {
				tp.push('00');
			}
			return ds + 'T' + tp.join(':');
		}
	},

	swephTopoStrToLatLng: (str) => {
		let latLng = {lat:null,lng:null}, dp = str.split(',');
		if (dp.length>1) {
			latLng = conversions.arrayToLatLng([dp[1],dp[0]]);
		}
		return latLng;
	},

	dateOffsetsToEuroDateTimeParts: (datetime,offset) => {
		let m = moment(datetime);
		m.subtract(offset,'seconds');
		return {b: m.format('DD.MM.YYYY'), ut: m.format('HH:mm')};
	}

}

module.exports = conversions;