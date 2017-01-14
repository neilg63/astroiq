const textutils = require('./text-utils.js');

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
		if (isObject(coords)) {
			if (!isArray(coords)) {
				if (coords.lat) {
					let parts = [coords.lat,coords.lng];
				}
			} else {
				let parts = coords;
			}
			return parts.join(',');
		}
	}
}

module.exports = conversions;