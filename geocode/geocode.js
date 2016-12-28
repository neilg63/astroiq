const request = require('request');
const {mongoose} = require('./../server/db/mongoose');
const {Geo} = require('./../server/models/geo');
const googleApiKey = 'AIzaSyAOeXTgZTB_cJUyV9B2DOiZI_6LoVU2vs8';

var geocode = {

	buildRequest: (address) => {
		var strAddress = encodeURIComponent(address);	
		return {
		  url: `https://maps.googleapis.com/maps/api/geocode/json?address=${strAddress}&key=${googleApiKey}`,
		  json: true,
		  rejectUnauthorized: false,
		  port: 443
		}
	},

	handleResponse: (error, body, callback) => {
		if (error) {
			callback('Unable to connect to Google servers' + JSON.stringify(error));
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
		  				lng: geo.location.lng,
		  				components: result.address_components[0],
		  				type: geo.location_type
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

geocode.fetchData = (searchString,res) => {
	geocode.geocodeAddress(searchString, (errorMessage, result) => {
		if (errorMessage){
			res.status(404).send({valid:false,message:errorMessage});
		} else {
      var geo = new Geo({
        string: searchString.toLowerCase(),
        address: result.address,
        location: {
          lat: result.lat,
          lng: result.lng
        },
        location_type: result.type,
        address_components: result.components
      });
      geo.save().then((doc) => {
          //
      }, (e) => {
          console.log(e);
      })
			result.valid = true;
			res.send(result);
		}
	});
};

module.exports = geocode;