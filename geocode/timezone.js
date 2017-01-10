const request = require('request');
const timezone_db_url = 'http://api.timezonedb.com/v2/get-time-zone';
const timezone_db_apikey = '0NXJ03JE76B4';

var timezone = {

	request: (data,date,method='zone',callback) => {
		var valid = false,
			href = timezone_db_url + `?key=0NXJ03JE76B4&format=json&by=${method}`;
		if (method == 'zone') {
			href + `zone=${data}`;
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
			}
		}
		if (valid) {
			if (typeof date == 'string') {
				var date = new Date(date);
			}
			if (date instanceof Date) {
				var timestamp = date.getTime() / 1000;
				href += `&time=${timestamp}`;
			}
			request(href, (error, response, body) => {
		      if (error){
		        callback({valid:false,msg:"Invalid parameters"},undefined);
		      } else {
		        callback(undefined,body);
	      	}
   		 });
		}
	},

};


module.exports = timezone;