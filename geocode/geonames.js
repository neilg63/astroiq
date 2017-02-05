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

  maxRows: 40, // max retrieved from geonames before filtering

  minScore: 15,

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

  assignLongName: function(item) {
    var nameParts = [item.toponymName],skipCountry = false, cName = '';
    if (item.adminName1.length > 1) {
      if (item.adminName1 != item.countryName) {
        nameParts.push(item.adminName1);
        switch (item.adminName1.toLowerCase()) {
          case 'scotland':
          case 'england':
          case 'wales':
            skipCountry = true;
            break;
        }
      }
      if (!skipCountry) {
        switch (item.countryCode) {
          case 'US':
            cName = 'USA';
            break;
          case 'UK':
          case 'GB':
            cName = 'UK';
            break;
          default:
            cName = item.countryName;
            break;
        }
        nameParts.push(cName);
      }
    }
    item.longName = nameParts.join(', ');
  },

  parseNames: (body,data,matchCoords,filterCoords) => {
    if (body.geonames.length>0) {
      let index=0,item,n,prevCoords={lat:-360,lng:-360},skip=false;
      let localityRgx = new RegExp('\\b(city|town|village)\\b','i');
      for (var k in body.geonames) {
        n = body.geonames[k];
        if (typeof n == 'object') {
          skip=false;
          if (index < geonames.maxMatches && n.score > geonames.minScore) {
            item = geonames.parseItem(n);
            
            skip = geonames.isAirport(item);
            if (!skip && index > 0) {
              skip = geonames.isNear(item,prevCoords,0.3);
              if (!skip) {
                skip = localityRgx.test(item.fclName) == false;
              }
            }
            if (!skip) {
              skip = item.population < 1; 
            }
            if (matchCoords) {
              item.matched = geonames.isNear(item,filterCoords,0.2);
            }
            if (!skip) {
              geonames.assignLongName(item);
              data.items.push(item);
              index++;
              prevCoords=item.coords;
            } 
          }
        }
      }
      data.num_items = data.items.length;
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
          if (typeof body == 'string') {
            body = JSON.parse(body);
            var data = {
              num_available: body.totalResultsCount,
              num_items: 0,
              bias: bias,
              items: []
            };
            if (body.geonames) {
              geonames.parseNames(body, data,matchCoords,filterCoords);
            }
            callback(undefined,data);
          }
        }
     });
    },

    mapCoords: (coords,callback,radius = 1) => {

      if (typeof coords == 'string') {
        coords = conversions.strToLatLng(coords);
      }
      if (typeof coords != 'object') {
        callback({valid: false,msg:"invalid parameters"},undefined);
        return;
      }
      var valid = false,
      href = geoNamesUrl + `/findNearbyPlaceNameJSON?formatted=true?style=full&type=json&formatted=true&lat=${coords.lat}&lng=${coords.lng}&username=${geoNamesUserName}`;
      if (radius > 1) {
        href += `&radius=${radius}`;
      }
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
                    data.radius = radius;
                    data.valid = true;
                    index++;
                  }
                  
                }
              }
            } else {
              if (radius < 300) {
                if (radius < 2) {
                  radius = 0;
                }
                radius += 100;
                geonames.mapCoords(coords,callback,radius);
              } else {
                var item = coords;
                item.elevation = 0;
                item.name = 'unknown';
                item.countryCode = "XX";
                item.fclName = "";
                item.countryName = "";
                item.adminName1 = "";
                data = geonames.parseItem(item);
                data.radius = radius;
                data.valid = true;
              }
            }
            timezone.request(data.coords,'NOW','position',(error,tData) => {
              if (error) {
                callback(undefined,data);
              } else {
                data.timezone = geonames.timezoneSimplify(tData);
                data.tzdb = tData;
                if (data.name == 'unknown' && data.countryCode == 'XX') {
                  data.name = tData.zoneName.split('/').reverse().join(', ');
                  data.countryCode = tData.countryCode;
                }
                callback(undefined,data);
              }
            });
            
          }

        }
     });
  },
};


module.exports = geonames;
