const request = require('request');
const geonames = require('./geonames.js');
const getIP = require('ipware')().get_ip;
const geoPluginUrl = 'http://www.geoplugin.net/json.gp';

var geoplugin = {

  getClientIp: (req) => {
    return (req.headers["X-Forwarded-For"] ||
        req.headers["x-forwarded-for"] ||
        '').split(',')[0] ||
       req.client.remoteAddress;
  },
	
  request: (req,callback) => {
		let ipInfo = getIP(req),
      ip = ipInfo.clientIp,
		  href = geoPluginUrl + `?ip=${ip}`;
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
              geonames.mapCoords(data.coords, (error,geoData) => {
                  if (error) {
                    callback(undefined,data);
                  } else {
                    callback(geoData,undefined);
                  }
              }); 
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