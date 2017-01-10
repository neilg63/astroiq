const request = require('request');
const {mongoose} = require('./../server/db/mongoose');
//const {Geoname} = require('./../server/models/geoname');
const geoNamesUrl = 'http://api.geonames.org';
const geoNamesUserName = 'serpentinegallery';

var geonames = {

  matchAltName: (ln,cc) => {
    let ccLangs = ['en'];
    switch (cc) {
      case 'RU':
        ccLangs.push('ru');
        break;
      case 'CH':
        ccLangs.push('zh_CN');
        break;
      case 'IT':
        ccLangs.push('it');
        break;
      case 'FR':
        ccLangs.push('fr');
        break;
      case 'DE':
        ccLangs.push('de');
        break;
      case 'IN':
        ccLangs.push('hi');
        break;
    }
    if (ln.isPreferredName || ccLangs.indexOf(ln.lang) > -1) {
      return true;
    }
    return false;
  },

  // search?formatted=true&q=Newcastle&username=serpentinegallery&style=full&type=json
	request: (searchStr,callback) => {
    var valid = false,
    href = geoNamesUrl + `/search?style=full&type=json&formatted=true&q=${searchStr}&username=${geoNamesUserName}`;
    request(href, (error, response, body) => {
        if (error){
          callback({valid:false,msg:"Invalid parameters"},undefined);
        } else {
          var data = {};
          if (typeof body == 'string') {
            body = JSON.parse(body);
            data.num_available = body.totalResultsCount;
            data.num = 0;
            data.names = [];
            if (body.geonames.length>0) {
              let index=0,max = 10,minScore=20,item,n,ln,cc;
              for (var k in body.geonames) {
                n = body.geonames[k];
                if (typeof n == 'object') {
                  if (index < max && n.score > minScore) {
                    item = {
                      altNames: []
                    };
                    cc = n.countryCode;
                    for (sk in n) {
                      switch (sk) {
                        case 'alternateNames':
                          for (lk in n[sk]) {
                            ln = n[sk][lk];
                            if (typeof ln == 'object') {

                              if (geonames.matchAltName(ln,cc)) {
                                item.altNames.push(ln);
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
                          break;
                        default:
                          item[sk] = n[sk];
                          break;
                      }
                    }
                  }
                  data.names.push(item);
                  index++;
                }
              }
              data.num = data.names.length;
            }
            callback(undefined,data);
          }

        }
     });

  },
};


module.exports = geonames;