const request = require('request');
const moment = require('moment-timezone');
const {mongoose} = require('./../db/mongoose');
const {Timezone} = require('./../models/timezone');
const timezone_db_url = 'http://api.timezonedb.com/v2/get-time-zone';
const config = require('./../config/config');

var timezone = {

	parseData: (json,coords_date) => {
		data = {
			coords_date: coords_date
		};
		for (var k in json) {
			switch (k) {
				case 'countryCode':
	  			case 'zoneName':
	  			case 'abbreviation':
	  			case 'gmtOffset':
	  			case 'dst':
	  			case 'dstStart':
	  			case 'dstEnd':
	  				data[k] = json[k];
	  				break;
			}
		}
		return data;
	},

	convertCountryCode: (countryCode) => {
		var zoneName = '';
		switch (countryCode) {
			case 'IS':
				zoneName = 'Atlantic/Reykjavik';
				break;
		}
		return zoneName;
	},

	checkGmtOffset: (data,datetime) => {
		if (!data.zoneName) {
			data.zoneName = '';
		}
		if (data.zoneName.length < 2) {
			data.zoneName = timezone.convertCountryCode(data.countryCode);
		}
		if (data.zoneName.length > 2) {
			var mom = moment.utc(datetime).tz(data.zoneName),
				parts = mom.format('Z').split(':');
	        if (parts.length>1) {
	          var hrs = parseInt(parts[0].replace('+','')) * 3600,
	            mins = parseInt(parts[1]) * 60;
	            data.gmtOffset = hrs + mins;
	        }
		}
		
        return data;
	},

	requestRemote: (href,coords_date,callback,dt) => {
		request(href, (error, response, body) => {
	    if (error){
	      callback({valid:false,msg:"Invalid parameters"},undefined);
	    } else {
	    	var valid = false;
	  		if (typeof body == 'string') {
	  			if (body.indexOf('{') === 0) {
	  				let json = JSON.parse(body),
	  					data = timezone.parseData(json,coords_date);
	  					data = timezone.checkGmtOffset(data,dt);
	  				var tz = new Timezone(data);
	  				tz.save().then((doc) => {
	            callback(undefined,data);
	          }, (e) => {
	            callback(undefined,data);
	          });
	  				valid = true;
	  			}
	    	}
	    	if (!valid) {
	    		callback({valid:false,msg:"Invalid parameters"},undefined);
	    	}
	  	}
	  });
  },

	request: (data,date,method='zone',callback) => {
		var valid = false,
			href = timezone_db_url + `?key=${config.timezonedb.apikey}&format=json&by=${method}`,
			coords_date = '';
		if (method == 'zone') {
			data = data.replace(':','/');
			href += `&zone=${data}`;
			coords_date = data;
			valid = true;
		} else {
			var lat,lng;
			if (typeof data == 'object') {
				if (data.lat) {
					lat = data.lat;
					lng = data.lng;
					valid = true;
				}	
			} else if (typeof data == 'string') {
				var parts = data.split(',');
				if (parts.length>1 && parts[1].length>0) {
					lat = parts[0];
					lng = parts[1];
					valid = true;
				}
			}

			if (valid) {
				href += `&lat=${lat}&lng=${lng}`;
				coords_date = Math.approxFixed(lat,3) + ',' + Math.approxFixed(lng,3);
			}
		}

		if (valid) {
			if (date === 'NOW') {
				var mt = moment.utc();
				date = mt.format('YYYY-MM-DD');
			} else {
				var mt = moment.utc(date);
			}
			var timestamp = parseInt(mt.format('x'));
			href += `&time=${timestamp}`;
			coords_date += '_' + moment.utc(date).format('YYYY-MM-DD');
		var matched = false;
		Timezone.findOne({
	      coords_date: coords_date
	    }).then((doc) => {
	    	if (doc !== null) {
	    		matched = true;
	    		var data = timezone.checkGmtOffset(doc.toObject(),date);
	    		callback(undefined, doc);
	    	} else {
	    		timezone.requestRemote(href,coords_date,callback,date);
	    		matched = true;
	    	}
	    }).catch((e) => {
	    	if (!matched) {
	    		callback({valid:false,msg:"application error",e:e});
	    	}
	    	
	    });
			
		}
	},

};


module.exports = timezone;