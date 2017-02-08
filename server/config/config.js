var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 9862;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
} else if (env === 'test') {
  process.env.PORT = 9862;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
}

const config = {
	google: {
		geocode_apikey: 'AIzaSyAOeXTgZTB_cJUyV9B2DOiZI_6LoVU2vs8',
		map_apikey: 'AIzaSyCGq1eIKwzv92oPoBGzxhIkp4C8anr0_Ow'
	},
	geonames: {
		username: 'serpentinegallery'
	},
	arcgis: {
	  client_id: 'NCoF20QyYqi5b0Wk',
	  client_secret: '91cac734947a4885b2baa4446984aaad',
	  url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/'
	},
	timezonedb: {
		apikey: '0NXJ03JE76B4'
	}
};

module.exports = config;
