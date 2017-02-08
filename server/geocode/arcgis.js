const request = require('request');
const config = require('./../config/config');
//const {mongoose} = require('./../server/db/mongoose');
const geonames = require('./geonames.js');
const textutils = require('./../lib/text-utils.js');
const conversions = require('./../lib/conversions.js');
const querystring = require('querystring');

var arcgis = {
  
  // generate a token with your client id and client secret
  getToken: (callback) => {
    request.post({
      url: 'https://www.arcgis.com/sharing/rest/oauth2/token/',
      json:true,
      form: {
        'f': 'json',
        'client_id': config.arcgis.client_id,
        'client_secret': config.arcgis.client_secret,
        'grant_type': 'client_credentials',
        'expiration': '86400'
      }
    }, function(error, response, body){
      callback(body.access_token);
    });
  },

  formatData: (data) => {
    let d = {
      num:0,
      items: []
    };
    var i=0,num=0, row;
    if (data.candidates) {
      if (data.candidates instanceof Array) {
        num = data.candidates.length;
        for (; i< num;i++) {
          item = arcgis.formatRow(data.candidates[i]);
          if (item.coords) {
            d.items.push(item);
          }
        }
      }
    }
    
    d.num = d.items.length;
    d.valid = d.num > 0;
    return d;
  },

  formatRow: (row) => {
    var item = {}, k, v;
    for (k in row) {
      v = row[k];
      switch (k) {
        case 'address':
          item.name = v;
          break;
        case 'score':
          item.score = parseFloat(v);
          break;
        case 'attributes':
          if (v.Addr_Type) {
            item.type = v.Addr_Type;
          }
          break;
        case 'location':
          if (v.y) {
            item.coords = {
              lat: v.y,
              lng: v.x
            }
          }
          break;
      }
    }
    return item;     
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
        if (gData.valid) {
          callback(undefined,gData);
        } else {
          callback(gData,undefined);
        }
      }
    });
  },

}


module.exports = arcgis;