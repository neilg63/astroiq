const request = require('request');
//const {mongoose} = require('./../server/db/mongoose');
const geonames = require('./geonames.js');
const textutils = require('./../lib/text-utils.js');
const conversions = require('./../lib/conversions.js');
const querystring = require('querystring');

const arcgisConfig = {
  client_id: 'NCoF20QyYqi5b0Wk',
  client_secret: '91cac734947a4885b2baa4446984aaad',
  url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/'
};

var arcgis = {
  
  // generate a token with your client id and client secret
  getToken: (callback) => {
    request.post({
      url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
      json:true,
      form: {
        'f': 'json',
        'client_id': arcgisAuth.client_id,
        'client_secret': arcgisAuth.client_secret,
        'grant_type': 'client_credentials',
        'expiration': '86400'
      }
    }, function(error, response, body){
      callback(body.access_token);
    });
  },

  formatData: (data) => {
    return data;
  },

  match: (strAddress,callback) => {
    let href = arcgisConfig.url + 'findAddressCandidates?SingleLine='+querystring.escape(strAddress)+'&outFields=Addr_Type&f=pjson'
    request(href,(error, response, body) => {
      if (error) {
        callback({valid:false}, undefined);
      } else {
        if (typeof body == 'string') {
          var data = JSON.parse(body);
        } else {
          data = body;
        }
        let gData = arcgis.formatData(data);
        callback(undefined,gData);
      }
    });
  },

}


module.exports = arcgis;