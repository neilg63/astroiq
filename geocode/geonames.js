const request = require('request');
const {mongoose} = require('./../server/db/mongoose');
const textutils = require('./../lib/text-utils.js');
const conversions = require('./../lib/conversions.js');
const timezone = require('./timezone.js');
//const {Geoname} = require('./../server/models/geoname');
const geoNamesUrl = 'http://api.geonames.org';
const geoNamesUserName = 'serpentinegallery';

var geonames = {

  maxMatches: 10,

  maxRows: 30, // max retrieved from geonames before filtering

  minScore: 20,

  matchAltName: (ln,cc) => {
    let ccLangs = ['en'];
    switch (cc) {
      case 'RU':
        ccLangs.push('ru');
        break;
      case 'CN':
        ccLangs.push('zh');
        break;
      case 'ES':
      case 'AR':
      case 'MX':
      case 'CO':
        ccLangs.push('es');
        break;
      case 'PT':
      case 'BR':
        ccLangs.push('pt');
        break;
      case 'EG':
      case 'SA':
      case 'SY':
        ccLangs.push('ar');
        break;
      case 'IT':
        ccLangs.push('it');
        break;
      case 'FR':
        ccLangs.push('fr');
        break;
      case 'DE':
      case 'AT':
        ccLangs.push('de');
        break;
      case 'IN':
        ccLangs.push('hi');
        break;
      case 'CH':
        ccLangs.push('de');
        ccLangs.push('fr');
        ccLangs.push('it');
        break;
      case 'BE':
        ccLangs.push('fr');
        ccLangs.push('nl');
        ccLangs.push('fl');
        break;
    }
    if (ccLangs.indexOf(ln.lang) > -1) {
      return true;
    }
    return false;
  },

  isAirport: (item) => {
    let airportRegex = new RegExp('\\bairport\\b','i');
    if (airportRegex.test(item.name)) {
      return true;
    }
    for (let i in item.alt_names) {
      if (item.alt_names[i].lang == 'en' && airportRegex.test(item.alt_names[i].name)) {
        return true;
      }
    }
    return false;
  },

  isNear: (item,coords,dist = 0.1) => {
    if (item.coords.lat) {

      if (item.coords.lat < (coords.lat + dist) 
          && item.coords.lat > (coords.lat - dist)
          && item.coords.lng < (coords.lng + dist)
          && item.coords.lng > (coords.lng - dist)
        ) {
        return true;
      }
    }
    return false;
  },

  parseItem: (n) => {
    let sk, cc,ln,v;
    var item = {
      coords: {lat:null,lng:null,alt:0},
      alt_names: []
    };
    cc = n.countryCode;
    for (sk in n) {
      switch (sk) {
        case 'alternateNames':
          for (lk in n[sk]) {
            ln = n[sk][lk];
            if (typeof ln == 'object') {
              if (geonames.matchAltName(ln,cc)) {
                item.alt_names.push(ln);
              } 
            }
          }
          break;
        case 'adminId1':
        case 'adminId2':
        case 'adminId3':
        case 'adminId4':
        case 'adminId5':
        case 'fclName':
        case 'adminCode1':
        case 'adminCode2':
        case 'adminCode3':
        case 'adminCode4':
        case 'fcl':
        case 'fcode':
        case 'countryId':
        case 'bbox':
        case 'adminCode5':
        case 'adminName5':
        case 'adminName4':
        case 'adminName3':
        case 'adminName2':
        case 'fcodeName':
          break;
        case 'lat':
        case 'lng':
        case 'elevation':
          v = n[sk];
          if (sk == 'elevation') {
            sk = 'alt';
          }
          item.coords[sk] = parseFloat(v);
          break;
        default:
          item[sk] = n[sk];
          break;
      }
    }
    return item;
  },

  parseNames: (body,data,matchCoords,filterCoords) => {
    if (body.geonames.length>0) {
      let index=0,item,n,prevCoords={lat:-360,lng:-360},skip=false;
      for (var k in body.geonames) {
        n = body.geonames[k];
        if (typeof n == 'object') {
          skip=false;
          if (index < geonames.maxMatches && n.score > geonames.minScore) {
            item = geonames.parseItem(n);
            skip = geonames.isAirport(item);
            if (!skip && index > 0) {
              skip = geonames.isNear(item,prevCoords,0.3);
            }
            
            if (matchCoords) {
              item.matched = geonames.isNear(item,filterCoords,0.2);
            }
            if (!skip) {
              data.names.push(item);
              index++;
              prevCoords=item.coords;
            }
            
          }
          
        }
      }
      data.num = data.names.length;
    }
  },

  timezoneSimplify: (data) => {
    let tz = {};
    if (typeof data == 'object') {
      for (k in data) {
        switch (k) {
          case 'gmtOffset':
            tz[k] = parseInt(data[k]) / 3600;
            break;
          case 'dst':
            tz.dstOffset = (parseInt(data.gmtOffset) + parseInt(data[k])) / 3600;
            break;
        }
      }
    }
    return tz;
  },

  // search?formatted=true&q=Newcastle&username=serpentinegallery&style=full&type=json
	request: (searchStr = '',bias = 'XX',mode='filtered',callback) => {
    var maxRows = mode == 'narrow'? 5 : geonames.maxRows;
    var valid = false,
    href = geoNamesUrl + `/search?style=full&type=json&formatted=true&q=${searchStr}&username=${geoNamesUserName}&maxRows=${maxRows}`,
    filterCoords={},matchCoords=false;
    if (conversions.isCoords(bias)) {
      var filterCoords = conversions.strToLatLng(bias);
      
      matchCoords = filterCoords.lat !== null;
    } else if (bias != 'XX') {
      href += `&countryBias=${bias}`;
    }

    request(href, (error, response, body) => {
        if (error){
          callback({valid:false,msg:"Invalid parameters"},undefined);
        } else {
          var data = {};
          if (typeof body == 'string') {
            body = JSON.parse(body);
            data.num_available = body.totalResultsCount;
            data.num = 0;
            data.bias = bias;
            data.names = [];
            if (body.geonames) {
              geonames.parseNames(body, data,matchCoords,filterCoords);
            }
            callback(undefined,data);
          }
        }
     });
    },

    mapCoords: (coords,callback) => {
      if (typeof coords == 'string') {
        coords = conversions.strToLatLng(coords);
      }
      if (typeof coords != 'object') {
        callback({valid: false,msg:"invalid parameters"},undefined);
        return;
      }
      var valid = false,
      href = geoNamesUrl + `/findNearbyPlaceNameJSON?formatted=true?style=full&type=json&formatted=true&lat=${coords.lat}&lng=${coords.lng}&username=${geoNamesUserName}`;
      request(href, (error, response, body) => {
        if (error){
          callback({valid:false,msg:"Invalid parameters"},undefined);
        } else {
          var data = {valid: false};
          if (typeof body == 'string') {
            body = JSON.parse(body);
            if (body.geonames.length>0) {
              let index=0,item,n;
              for (var k in body.geonames) {
                n = body.geonames[k];
                if (typeof n == 'object') {
                  if (index < 1) {
                    data = geonames.parseItem(n);
                    data.valid = true;
                    index++;
                  }
                  
                }
              }
            }
            timezone.request(data.coords,'NOW','position',(error,tData) => {
              if (error) {
                callback(undefined,data);
              } else {
                data.timezone = geonames.timezoneSimplify(tData);
                data.tzdb = tData;
                callback(undefined,data);
              }
            });
            
          }

        }
     });
  },
};


module.exports = geonames;