const request = require('request');
const googleApiKey = 'AIzaSyAOeXTgZTB_cJUyV9B2DOiZI_6LoVU2vs8';

var geocode = {

	buildRequest: (address) => {
		var strAddress = encodeURIComponent(address);	
		return {
		  url: `https://maps.googleapis.com/maps/api/geocode/json?address=${strAddress}&key=${googleApiKey}`,
		  json: true
		}
	},

	handleResponse: (error, body, callback) => {
		if (error) {
			callback('Unable to connect to Google servers' + JSON.stringfy(error));
		} else if (body.status === 'ZERO_RESULTS') {
			callback('Unable to find a matching address');
		} else if (body.status === 'OK') {
		  if (body.results) {
		  	var result = body.results[0];
		  	if (result.geometry) {
		  		var geo = result.geometry,
		  			data = {
		  				address: result.formatted_address,
		  				lat: geo.location.lat,
		  				lng: geo.location.lng
		  			};
				callback(undefined,data);
		  	}
		  }
		  
		}
	},

	geocodeAddress: (address,callback) => {
		request(geocode.buildRequest(address), (error, response, body) => {
			geocode.handleResponse(error,body, callback);
		});
	}


};

module.exports = geocode;