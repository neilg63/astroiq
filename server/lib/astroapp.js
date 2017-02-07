const {mongoose} = require('./../db/mongoose');
const {Nested} = require('./../models/nested');
const conversions = require('./conversions');
const exec = require('child_process').exec;
const request = require('request');
var astro = {};

function toItem(columns) {
	var data={
		lng:null,
		lat:null,
		ecl:null,
	};
	if (columns instanceof Array) {
		for (var i=0;i<columns.length;i++) {
			if (i<3) {
				var colVal = toDegrees(columns[i]).toFloat();
				switch (i) {
					case 0:
						data.lng = colVal;
						break;
					case 1:
						data.lat = colVal;
						break;
					case 2:
						data.ecl = colVal;
						break;
				}
			}
		}
	}
	return data;
}

function isNumeric(val) {
	if (typeof val == 'number') {
		return val !== NaN;
	} else if (typeof val == 'string') {
		return /^\s*-?\d+(\.\d+)?|\.d+\s*$/.test(val);
	}
	return false;
}

function Degree(degrees,minutes,seconds,positive) {
	this.hasMinutes = isNumeric(minutes);
	this.positive = positive;
	if (isNumeric(degrees)) {
		if (this.hasMinutes) {
			this.degrees = parseInt(degrees);
		} else {
			this.degrees = parseFloat(degrees);
		}
	} else {
		this.degrees = 0;
	}
	if (this.hasMinutes) {
		this.minutes = parseInt(minutes);
	} else {
		this.minutes = 0;
	}
	if (isNumeric(seconds)) {
		this.seconds = parseFloat(seconds);
	} else {
		this.seconds = 0;
	}
	this.toFloat = function() {
		const mins = this.minutes/60, secs = this.seconds/3600;
		if (this.positive) {
			return this.degrees + mins + secs;
		} else {
			return this.degrees - mins - secs;
		}
	}
	this.decimal = this.toFloat();
	return this;
}

function toDegrees(string) {
	var degrees=0,minutes=0,seconds=0,positive = true, val;
	if (typeof string == 'string') {
		string = string.replace(/[°'"]/g,',');
		var parts = string.split(','),numParts = parts.length,i=0;
		if (numParts >= 3) {
			for (;i<numParts;i++) {
				if (isNumeric(parts[i])) {
					val = parts[i];
					if (i == 0) {
						val = val.toString().trim();
						if (val.indexOf('-') === 0) {
							positive = false;
						}
					}
					val = parseFloat(val);
					switch (i) {
						case 0:
							degrees = val;
							break;
						case 1:
							minutes = val;
							break;
						case 2:
							seconds = val;
							break;
					}
				}
			}
		}
	}

	return new Degree(degrees,minutes,seconds,positive);	
}

astro.toDegrees = toDegrees;


/*function houseParameter(lng, lat, houseType) {
	if (!houseType) {
		houseType = 'W';
	}
	if (typeof lat == 'string') {
		lat = toDegrees(lat);
	}
	if (typeof lng == 'string') {
		lng = toDegrees(lng);
	}
	if (lng instanceof Degree && lat instanceof Degree) {
		return lng.toFloat() + ',' + lat.toFloat() + ',' + houseType;
	}
}

function coordsStringToHouseParameters(coordStr,houseType) {
	var coords = coordStr.trim().replace(/([°'])\s+(-?[0-9])/g,"$1$2").split(/[ ,]+/);
	if (coords.length>1) {		
		return houseParameter(coords[0],coords[1],houseType)
	}
}

astro.coordsStringToHouseParameters = coordsStringToHouseParameters;*/

function toNutation(columns) {
	var data=[];
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			if (val.length>2) {
				data.push(toDegrees(val).decimal);
			}
		}
	}
	return data;
}

function toUt(columns) {
	var data={value:null,delta:null,deltaType:'t',unit:'sec'};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case 0:
					data.value = parseFloat(val);
					break;
				case 2:
					data.deltaType = val.split(':').shift();
					break;
				case 3:
					data.delta = parseFloat(val);
					break;
				case 4:
					data.unit = val.sanitize();
					break;
			}
		}
	}
	return data;
}

function toDateInfo(columns,type) {
	var data={date:null,time:null,calendar:null,zone:'UT',version:null};
	if (columns instanceof Array) {
		var numCols = columns.length,
			i=0,
			offset = type == 'date_dmy'? 0 : 1,
			val,dt;

		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case (0+offset):
					var parts = val.split('.');
					
					dt = parts.reverse().join('-');
					if (parts.length==3 && isNumeric(parts[2])) {
						data.date = new Date(dt);
            data.date.setUTCDate(parts[2]);
					}
					break;
				case (1+offset):
					data.calendar = val;
					break;
				case (2+offset):
					if (/^\d+:\d+:\d+$/.test(val)) {
						var parts = val.split(':');
						data.time = val;
						data.date.setUTCHours(parts[0],parts[1],parts[2]);
					}
					break;
				case (3+offset):
					data.zone = val;
					break;
				case (5+offset):
					data.version = val;
					break;
			}
		}
	}
	return data;
}

function toSwetestParams(columns) {
	var params = {};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val,key;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			key = null;
			if (val.startsWith('-b')) {
				key = 'b';
			} else if (val.startsWith('-f')) {
				key = 'f';
			} else if (val.startsWith('-ut')) {
				key = 'ut';
			} else if (val.startsWith('-f')) {
				params.f = val.trim(/^-f/,'');
			} else if (val.startsWith('-geopos')) {
				key = 'geopos';
			} else if (val.startsWith('-topo')) {
				key = 'topo';
			} else if (val.startsWith('-house')) {
				key = 'house';
			}
			if (typeof key == 'string') {
				params[key] = val.replace(new RegExp('^-'+key),'');
			}
		}

	}
	return params;
}

function toEpsilon(columns) {
	var data={mode:false,value:null};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
			switch (i) {
				case 0:
					val = val.sanitize();
					data.mode = true  == 'true';
					break;
				case 1:
					data.value = toDegrees(val).decimal;
					break;
			}
			val = columns[i].trim();
		}
	}
	return data;
}

function toGeo(columns) {
	var data={lat:null,lng:null,alt:null};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,val;
		if (columns.length>3) {
			if (columns[0] == 'long' && columns[2] == 'lat') {
				for (;i<numCols;i++) {
					val = columns[i].trim();
					switch (i) {
						case 1:
							data.lng = val.toFloat();
							break;
						case 3:
							data.lat = val.toFloat();
							break;
						case 5:
							if (isNumeric(val)) {
								data.alt = parseFloat(val);
							}
							break; 
					}
				}
			}
		}
		
	}
	return data;
}

function toHouse(columns) {
	var data={letter:"W",mode:""};
	if (columns instanceof Array) {
		var numCols = columns.length,i=0,
			modeCaptured=false,longIndex=5,latIndex=7,val;
		for (;i<numCols;i++) {
			val = columns[i].trim();
      if (/lat=/.test(val)) {
        latIndex = i+1;
      }
      if (/long=/.test(val)) {
        longIndex = i+1;
      }
			switch (i) {
				case 1:
					data.letter = val;
					break;
				case longIndex:
					data.lng = toDegrees(val).decimal;
					break;
				case latIndex:
          data.lat = toDegrees(val).decimal;
					break;
				default:
					if (i >= 2 && !modeCaptured) {
						if (i>2) {
							data.mode += " ";
						}
						data.mode += val
						if (val.endsWith(')')) {
							modeCaptured = true;
						} else {
							longIndex++;
							latIndex++;
						}
					}

					if (val.sanitize() == "long") {
						longIndex = i+1;
					} else if (val.sanitize() == "lat") {
						latIndex = i+1;
					}
					break;
			}
		}
	}
	return data;
}

function isBetween(v1, lower,upper) {
  if (upper < lower) {
    return (v1 > lower || v1 <= upper);
  } else {
    return (v1 < upper && v1 >= lower);
  }
  
}

function isInRange(v1, v2,tolerance) {
  return isBetween(v1,(v2-tolerance),(v2+tolerance));
}

astro.findCollisions = (bodies,key,degRange=9) => {
	var aspectData = {
		collisions: [],
		aspects: []
	},
	item = bodies[key],lng = -1,bn;
	if (typeof item == 'object') {
	  if (item.lng) {
	     lng = item.lng;
	  }
	}
	if (lng > -1) {
	  for (bn in bodies) {
	    if (bn != key) {
	      item = bodies[bn];
	      if (typeof item == 'object') {
	      	if (item.lng) {
	      		if (isInRange(item.lng,lng,degRange)) {
		          aspectData.collisions.push(bn);
		        } else if (isBetween(item.lng,(lng+150)%360,(lng+210)%360)) {
              aspectData.aspects.push({
                key: bn,
                to: item.lng,
                band: 1
              });
            } else if (isBetween(item.lng,(lng+105)%360,(lng+150)%360)) {
              aspectData.aspects.push({
                key: bn,
                to: item.lng,
                band: 2
              });
            } else if (isBetween(item.lng,(lng+60)%360,(lng+105)%360)) {
              aspectData.aspects.push({
                key: bn,
                to: item.lng,
                band: 3
              });
            }
	      	}
	      }
	    }
	  }
	}
	return aspectData;
};

function cleanLine(line) {
	return line.trim().replace(/(-?\d+)°\s{0,2}(-?\d+)'\s{0,2}(-?\d+)/g,'$1,$2,$3');
}

astro.model = {
	datetime: "",
	dateinfo: {
		zone: "Europe/Helsinki",
		calendar: "greg."
	},
	name: "",
	gender: "unknown",
	geo: {
		address: "",
		alt: 0,
		lng: 0,
		lat: 0
	},
	astro: {},
	ayanamsa: {},
	houseData: {},
	houses: {},
	bodies: {},
	swetest: {}
};

astro.parseLine = (line,data, debug) => {
	var items = cleanLine(line).split(/\s+/),
		isCompoundKey=false, key,keyParts=[],subKey,firstKey;
  	if (items.length>1) {
  		key = items.shift().sanitize('_');
  		firstKey = key;
  		switch (key) {
  			case 'mean':
  			case 'true':
  			case 'house':
  			case 'osc':
  			case 'intp':
  				key += '_' + items.shift().toLowerCase();
  				break;
  		}

  		if (items[0].startsWith("(")) {
  			key += '_' + items.shift().sanitize("_");
  		}
  		
  		switch (key) {
  			case 'swetest':
  				if (debug) {
  					data[key] = toSwetestParams(items);
  				}
  				break;
  			case 'ut':
  				data[key] = toUt(items);
  				break;
  			case 'et':
  				data[key] = parseFloat(items[0]);
  				break;
  			case 'date':
  			case 'date_dmy':
  				data[key] = toDateInfo(items, key);
  				break;
  			case 'epsilon':
  				data[key] = toEpsilon(items);
  				break;
  			case 'sun':
			case 'moon':
			case 'mercury':
			case 'venus':
			case 'mars':
			case 'jupiter':
			case 'saturn':
			case 'uranus':
			case 'neptune':
			case 'pluto':
			case 'chiron':
			case 'pholus':
			case 'ceres':
			case 'pallas':
			case 'juno':
			case 'vesta':
			case 'cupido':
			case 'hades':
			case 'zeus':
			case 'kronos':
			case 'apollon':
			case 'admetos':
			case 'vulcanus':
			case 'poseidon':
			case 'isis_transpluto':
			case 'nxbiru':
			case 'nibiru':
			case 'harrington':
			case 'leverrier_neptune':
			case 'adams_neptune':
			case 'lowell_pluto':
			case 'pickering_pluto':
			case 'vulcan':
			case 'proserpina':
				data[key] = toItem(items);
				break;
			case 'houses':
				data[key] = toHouse(items);
				break;
			case 'geo':
				data[key] = toGeo(items);
				break;
			case 'nutation':
				data[key] = toNutation(items);
				break;
			case 'ayanamsa':
				var vals = toNutation(items);
				if (vals) {
					if (vals.length>0) {
						data[key] = vals[0];
					}
				}
				break;
			case 'epsilon__true':
				data['epsilon_true'] = toItem(items);
				break;
			case 'mean_node':
			case 'true_node':
			case 'mean_apogee': 
			case 'osc_apogee':
			case 'intp_apogee':
			case 'intp_perigee':
			case 'epsilon_true':
				data[key] = toItem(items);
				break;
			default:
				switch (firstKey) {
					case 'house':
					case 'mc':
					case 'ascendant':
					case 'armc':
					case 'vertex':
						data[key] = toDegrees(items[0]).toFloat();
						break;
					default:
						data[key] = items;
						break;
				}
				break;
  		}
  	}
}



function valToGeoLine(val,key,data) {
	var item = "";
	if (typeof val == 'string') {
		val = val.split(',');
	}
	if (val instanceof Array && val.length >= 2) {
		item += val[0] + ',' + val[1];

		switch (key) {
			case "house":
				item += "," + data.system;
				break;
			case "geopos":
			case "topo":
				if (!data.elev && val.length > 2) {
					if (/^\d+$/.test(val[2])) {
						data.elev = parseInt(val[2]);
					}
				}
				if (data.elev) {
					item += "," + data.elev;
				} else {
					item += ",0";
				}
				break;
		}
	}
	return item;
}

astro.composeSwetestQuery = (params) => {
	var paramParts = ["swetest"],
		data = {
		"b": "3.10.1963",
		"ut": "03.0000",
		"f": "PLEBS",
		"elev": 0,
		"system": "W",
		"sid": "0"
	},
	matched=true,item,val,tp;
	if (typeof params == 'object') {
		for (key in params) {
		if (data[key]) {
				data[key] = params[key];
			}
		}
	}
	if (params.topo) {
		data.topo = params.topo;
	} else if (params.geopos) {
		data.geopos = params.geopos;
	} 

	for (key in data) {
		item = "-" + key;
		val = data[key];
		tp = typeof val;
		matched = true,
		elev = 0;
		switch (key) {
			case "system":
			case "elev":
				matched = false;
				break;
			case "geopos":
			case "house":
			case "topo":
				if (data.elev) {
					if (/^\s*\d+\s*$/.test(data.elev)) {
						data.elev = parseInt(data.elev);
					}
				}
				item += valToGeoLine(val,key,data);
				break;
			case 'sid':
				if (tp == 'string') {
					if (/^\d+$/.test(val)) {
						val = parseInt(val);
						tp = typeof val;
					}
				}
				if (tp == 'number') {
					item += val.toString();
				} else {
					matched = false;
				}
				break;
			default:
				item += val;
				break;
		}
		if (matched) {
			paramParts.push(item);
		}
	}
	if (!data.house) {
		var coords;
		if (data.geopos) {
			coords = data.geopos;
		} else if (data.topo) {
			coords = data.topo;
		}

		if (coords){
			item = "-house" + valToGeoLine(coords,"house",data);
			paramParts.push(item);
			if (params.system) {
				if (typeof params.system == 'string') {
					var hsyV = "-hsy" + params.system.toUpperCase();
					paramParts.push(hsyV);
				}
			}

		}
	}
	return paramParts.join(" ");
};

astro.composeSwetestQueryAyanamsa = function(params) {
	var paramParts = ["swetest"],
		data = {
		"b": "3.10.1963",
		"ut": "03.0000",
		"f": "PLEBS",
		"topo": [0,0],
		"system": "W",
		"ay": "1"
	},
	matched=true,item,val;
	if (typeof params == 'object') {
		for (key in params) {
		if (data[key]) {
				data[key] = params[key];
			}
		}
	}
	for (key in data) {
		item = "-" + key;
		val = data[key];
		matched = true;
		switch (key) {
			case "system":
			case "elev":
				matched = false;
				break;
			case "geopos":
			case "house":
			case "topo":	
				item += valToGeoLine(val,key,data);
				break;
			default:
				item += val;
				break;
		}
		if (matched) {
			paramParts.push(item);
		}
	}
	return paramParts.join(" ");
}

astro.parseOutput = (stdout,debug) => {
  var lines = stdout.split(/\n/),
    data={};
  for (var i=0;i< lines.length;i++) {
  	if (typeof lines[i] == 'string') {
  		astro.parseLine(lines[i],data, debug);
  	}
  }
  return data;
}

astro.matchHouse = (model,key) => {
	if (model.bodies[key]) {
		var v = model.bodies[key].lng,hs;
		for (i in model.house_bounds) {
			hs = model.house_bounds[i];
			if (v >= hs.lng && v < hs.end) {
				var frac = calcDegreeSpan(hs.lng,v) / hs.spn;
				model.bodies[key].house = parseInt(hs.num) + frac;
				break;
			}
		}
	}
}

var calcDegreeSpan = (startDeg,endDeg) => {
	if (endDeg > startDeg) {
		return endDeg - startDeg;
	} else {
		return Math.abs(endDeg - (360-startDeg));
	}
}

astro.calcHouseBounds = (houses) => {
  var arrHouses = Object.keys(houses).map((key) => houses[key]),
    houseKeys = Object.keys(houses).map((key) => key),
    maxHouseValue = Math.max.apply(null,arrHouses),
    firstHouse = arrHouses[0],
    secondHouse = arrHouses[1],
    lastHouse = arrHouses[(arrHouses.length-1)];

	var houseData = [],lng=0, lastLng=false,prevKey,firstKey,index=0;

	for (bv in houses) {
		lng = houses[bv];
		if (lastLng !== false) {
			houseData.push({
				num: prevKey,
				lng: lastLng,
				spn: calcDegreeSpan(lastLng,lng),
				end: lng
			});
		}
    if (index === 0) {
      firstHouse = lng;
      firstKey = bv;
    }
    index++;
		lastLng = lng;
		prevKey = bv;
	}

	houseData.push({
		num: prevKey,
		lng: lastLng,
		spn: calcDegreeSpan(lastLng,firstHouse),
		end: firstHouse
	});
  return houseData;
};

astro.calcHouseData = (m) => {
	//var b, hv, v, nxHv, hvStart, hvEnd,neg,diff, mh,diffDegs;
	m.house_bounds = astro.calcHouseBounds(m.houses);
	for (k in m.bodies) {
		astro.matchHouse(m,k);
	}
	return m.house_bounds;
};

astro.mapHouses = (arrHouses) => {
  var data={};
  if (arrHouses instanceof Array) {
    var i=0,num = arrHouses.length, key;
    for (;i<num;i++) {
      key = (i+1) . toString();
      data[key] = arrHouses[i];
    } 
  }
  return data;
}

astro.fetchData = (stdout,debug) => {
	var data = astro.parseOutput(stdout,debug),
		isHouse=false,parts=[],subK;
	var m = astro.model;
	m.houses={};
	for (k in data) {
		isHouse = k.indexOf('house_') === 0;
		if (isHouse) {
			parts = k.split("_");
			if (parts.length > 1) {
				subK = parts.pop();
				m.houses[subK] = data[k];
			}
			
		} else {
			switch (k) {
				case 'date_dmy':
					m.datetime = data[k].date;
          m.dateinfo = {
            zone: data[k].zone,
            calendar: data[k].calendar
          };
					break;
				case 'houses':
					m.houseData = data[k];
					break;
				case 'geo':
					m.geo = data[k];
					break;
				case 'sun':
				case 'moon':
				case 'mercury':
				case 'venus':
				case 'mars':
				case 'jupiter':
				case 'saturn':
				case 'uranus':
				case 'neptune':
				case 'pluto':
				case 'chiron':
				case 'pholus':
				case 'ceres':
				case 'pallas':
				case 'juno':
				case 'vesta':
				case 'cupido':
				case 'hades':
				case 'zeus':
				case 'kronos':
				case 'apollon':
				case 'admetos':
				case 'vulcanus':
				case 'poseidon':
				case 'isis_transpluto':
				case 'nxbiru':
				case 'nibiru':
				case 'harrington':
				case 'leverrier_neptune':
				case 'adams_neptune':
				case 'lowell_pluto':
				case 'pickering_pluto':
				case 'vulcan':
				case 'proserpina':
					m.bodies[k] = data[k];
					break;
				case 'swetest':
					m.swetest = data[k];
					break;
				default: 
					var dt = typeof data[k];
					switch (dt) {
						case 'object':
							m.astro[k] = data[k];
							break;
						default:
							m.astro[k] = data[k];
							break;
					}
					
					break;
			}
		}
	}
	if (m.bodies) {
		astro.calcHouseData(m);
	}
	return m;
}

astro.mapData = (doc) => {
	var data = {};
	data.id = doc._id;
  data.datetime = doc.datetime;
  data.dateinfo = doc.dateinfo;
  data.name = doc.name;
  data.chartType = doc.chartType;
  data.gender = doc.gender;
  data.geo = doc.geo;
  data.astro = doc.astro;
  data.houseData = doc.houseData;
  data.bodies = astro.parseBodies(doc);
  data.houses = astro.mapHouses(doc.houses);
  data.houseBounds = astro.calcHouseBounds(data.houses);
  data.ayanamsa = doc.ayanamsa;
  data.cmd = doc.cmd;
  data.stored = true;
  data.valid = true;
  return data;
}

astro.saveData = (model,callback) => {
  var data = {},update=false,id;

  if (typeof model == 'object') {
    if (model.cmd && model.geo) {
       if (!model.name) {
          model.name = 'unknown';
       }
       if (!model.gender) {
          model.gender = 'unknown';
       }
       if (model.id) {
       	id = model.id;
       	update = id.length>10;
       }
       data.chartType = model.chartType;
       data.name = model.name;
       data.gender = model.gender;
       data.cmd = model.cmd;
       data.datetime = model.datetime;
       data.dateinfo = model.dateinfo;
       data.geo = model.geo;
       data.astro = model.astro;
       data.bodies = model.bodies;
       data.houseData = model.houseData;
       if (model.ayanamsa) {
           data.ayanamsa = model.ayanamsa;
       } else {
          data.ayanamsa = 0;
       }
       data.houses = Object.keys(model.houses).map((key) => model.houses[key]);
       var nested = new Nested(data);
       if (update) {
       		Nested.findById(id, function (err, record) {
					  if (err) {
					  	return callback(err);
					  }
					  var k;
					  for (k in data) {
					  	if (k !== 'id') {
					  		record[k] = data[k];
					  	}
					  }
					  record.save(function (err, doc) {

					    callback(astro.mapData(doc));
					  });
					});
       } else {
	       	nested.save().then((doc) => {
	          callback(astro.mapData(doc));
	        }, (e) => {
	          callback({valid:false,msg:"System error 1"});
	      });
       }
       
    }
  }
  return data;
}

astro.results = (res,page) => {
  Nested.find().then((data) => {
    res.send({
      num: data.length,
      page: page,
      items: data
    });
  }).catch((e) => {
    res.status(400).send();
  });
};

astro.get = (query,res, debug) => {
  var cmd = astro.composeSwetestQuery(query);
  if (cmd.length > 4) {
	  cmd = cmd.cleanCommand();
	  if (cmd.length > 4) {
	   astro.fetch(cmd,res,query, debug);
		}
  }
}

astro.download = (id,callback) => {
  var cmd = 'phantomjs screengrab.js ' + id;
  if (cmd.length > 4) {
  	var child = exec(cmd, (error, stdout, stderr) => {
	  	callback({href:'/screengrab-' + id + '.pdf'});
		});
  }
}

astro.getById = (id,callback) => {
	Nested.findById(id).then((doc) => {
    var matched = false;
    if (typeof doc == 'object') {
      if (doc.houses) {
      	var data = astro.mapData(doc);
        matched = true;
        callback(data);
      }
    }
    if (!matched) {
      callback({valid:false,msg:"No matching records"})
    }
  }).catch((e) => {
    callback({valid:false,msg:"System error"})
  });
}

astro.fetch = (cmd, res, query, debug) => {
  var cmdId = cmd.trim().replace(/^swetest\s+/i,'').replace(/\s+/g,'_'),
  	update = false;
  if (query.id) {
  	update = query.id.length>10;
  }
  if (update) {
  	astro.fetchFromCommand(cmd, cmdId, res, query, update,debug);
  }
  else {
  	Nested.findOne({
	    cmd: cmdId
	  }).then((doc) => {
	    var matched = false;
	    if (typeof doc == 'object') {
	      if (doc.houses) {
	      	var data = astro.mapData(doc);
	        matched = true;
	        res.send(data);
	      }
	    }
	    if (!matched) {
	      astro.fetchFromCommand(cmd, cmdId, res, query, update,debug);
	    }
	  }).catch((e) => {
	    astro.fetchFromCommand(cmd, cmdId, res, query, update, debug);
	  });
  }
};

astro.parseBodies = (data) => {
	var b = {}, rahu, k, as;
	if (data.bodies) {
		for (k in data.bodies) {
			if (typeof data.bodies[k] == 'object') {
				if (data.bodies[k].lng) {
          as = astro.findCollisions(data.bodies,k,9);
					b[k] = {
						lng: data.bodies[k].lng,
						lat: data.bodies[k].lat,
						ecl: data.bodies[k].ecl,
						collisions: as.collisions,
            aspects: as.aspects
					};
				}
			}
		}
		if (data.true_node) {
			rahu = data.true_node;
	  } else if (data.astro.true_node) {
	  	rahu = data.astro.true_node;
	  }
	  if (rahu) {
	  	b.rahu = {
        lng: rahu.lng,
        lat: rahu.lat,
        ecl: rahu.ecl,
        aspects:[],
        collisions:[]
      };
	    b.ketu = {
	    	lng: (rahu.lng + 180) % 360,
	    	lat: rahu.lat,
	    	ecl: rahu.ecl,
        aspects:[],
        collisions:[]
	    };
      as = astro.findCollisions(b,'rahu',9);
      b.rahu.collisions = as.collisions;
      b.rahu.aspects = as.aspects;
      as = astro.findCollisions(b,'ketu',9);
      b.ketu.collisions = as.collisions;
      b.ketu.aspects = as.aspects;
	  }
	}
  return b;
}

astro.fetchFromCommand = (cmd, cmdId, res, query, update, debug) => {
  var child = exec(cmd, (error, stdout, stderr) => {
    var data = astro.fetchData(stdout,debug);
    if (debug) {
      data.swetest.cmd = cmd;
      data.swetest.raw = `<pre>${stdout}</pre>`;
    }

    if (error !== null) {
      data = {"valid": false,"msg": "Server error"};
    }
    var ayCmd = astro.composeSwetestQueryAyanamsa(query);
    if (ayCmd.length > 4) {
      ayCmd = ayCmd.cleanCommand();
      child = exec(ayCmd, (error, stdout, stderr) => {
        var ayData =  astro.parseOutput(stdout,debug);
        data.ayanamsa = ayData.ayanamsa;
        data.cmd = cmdId;
        if (!data.geo) {
        	data.geo = {};
        }
        if (query.address) {
        	data.geo.address = query.address;
        } else {
        	data.geo.address = 'unknown';
        }
        if (query.chartType) {
        	data.chartType = query.chartType;
        } else {
        	data.chartType = 'birth';
        }
        data.datetime = conversions.euroDatePartsToISOString(query.b,query.ut);
        data.dateinfo = {
        	calendar: "greg.",
        	zone: query.tz,
          gmtOffset: query.gmtOffset
        };
        data.name = query.name;
        data.gender = query.gender;
        if (update) {
        	data.id = query.id;
        }
        astro.saveData(data,function(data) {
        	data.valid = true;
        	res.send(data);
        });
        
      });
    }
  });
};

astro.saveSettings = function(query,res) {
	res.send({valid:true});
};


module.exports = astro;