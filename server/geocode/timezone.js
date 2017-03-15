const request = require('request');
const {mongoose} = require('./../db/mongoose');
const {Timezone} = require('./../models/timezone');
const timezone_db_url = 'http://api.timezonedb.com/v2/get-time-zone';
const config = require('./../config/config');

var timezone = {

	parseData: (json,coords_date) => {
		data = {
			coords_date: coords_date
		};
		console.log(json)
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

	requestRemote: (href,coords_date,callback) => {
		request(href, (error, response, body) => {
	    if (error){
	      callback({valid:false,msg:"Invalid parameters"},undefined);
	    } else {
	    	var valid = false;
	  		if (typeof body == 'string') {
	  			if (body.indexOf('{') === 0) {
	  				let json = JSON.parse(body),
	  					data = timezone.parseData(json,coords_date);
	  				
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
			if (typeof date == 'string' && date !== 'NOW') {
				var date = new Date(date);
			}
			if (date instanceof Date) {
				var timestamp = date.getTime() / 1000;
				href += `&time=${timestamp}`;
				coords_date += '_' + date.toISOString().split('T').shift();
			}

		var matched = false;
		Timezone.findOne({
	      coords_date: coords_date
	    }).then((doc) => {
	    	if (doc !== null) {
	    		matched = true;
	    		callback(undefined, doc);
	    	} else {
	    		timezone.requestRemote(href,coords_date,callback);
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