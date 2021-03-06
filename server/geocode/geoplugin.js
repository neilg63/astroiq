const request = require('request');
const geonames = require('./geonames.js');
const getIP = require('ipware')().get_ip;
const geoPluginUrl = 'http://www.geoplugin.net/json.gp';
const config = require('./../config/config');

var geoplugin = {

  request: (req,callback) => {
		let ipInfo = getIP(req),
      ip = ipInfo.clientIp;

    if (ip.endsWith('127.0.0.1')) {
      ip = '149.126.76.98';
    }
		let  href = geoPluginUrl + `?ip=${ip}`;
		request(href, (error,response,body) => {
      if (error) {
        callback({valid:false,msg: error},undefined);
      } else {
        if (typeof body =='string') {
         var json = JSON.parse(body),
           data={
            coords: {lat: null, lng: null}
           },
           skip=false,
           sk,
           isCoord = false;
          for (var k in json) {
            sk = k.replace('geoplugin_','');
            skip=false;
            isCoord = false;
            switch (sk) {
              case 'longitude':
                sk = 'lng';
                isCoord = true;
                break;
              case 'latitude':
                sk = 'lat';
                isCoord = true;
                break;
              case 'credit':
              case 'regionCode':
              case 'regionCode':
              case 'dmaCode':
              case 'currencySymbol':
              case 'currencySymbol_UTF8':
                skip= true;
                break;
            }
            if (!skip) {
              if (isCoord) {
                data.coords[sk] = parseFloat(json[k]);
              } else {
                data[sk] = json[k];
              }
            }
          }
          let matched = false;
          if (data.countryCode) {
            if (typeof data.countryCode == 'string') {
              matched = true;
              geonames.mapCoords(data.coords,callback);
            }
          }
          if (!matched) {
            callback(undefined,data);
          }
        } else {
          callback({valid:false,msg: "Invalid request"},undefined);
        }
      }
		});

	}
}

module.exports = geoplugin;