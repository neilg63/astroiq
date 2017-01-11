const request = require('request');
const reqIp = require('request-ip');
const geoPluginUrl = 'http://www.geoplugin.net/json.gp';

var geoplugin = {

  getClientIp: (req) => {
    return (req.headers["X-Forwarded-For"] ||
        req.headers["x-forwarded-for"] ||
        '').split(',')[0] ||
       req.client.remoteAddress;
  },
	
  request: (req,callback) => {
		let ip = geoplugin.getClientIp(req).split(':').pop(),
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
                break;
              case 'latitude':
                sk = 'lat';
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
          callback(undefined,data);
        } else {
          callback({valid:false,msg: "Invalid request"},undefined);
        }
      }
		});

	}
}

module.exports = geoplugin;