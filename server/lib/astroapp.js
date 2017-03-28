const {mongoose} = require('./../db/mongoose');
const {Nested} = require('./../models/nested');
const {Chart} = require('./../models/chart');
const {Person} = require('./../models/person');
const {User} = require('./../models/user');
const {Group} = require('./../models/group');
const {EventType} = require('./../models/eventType');
const {Tag} = require('./../models/tag');
const conversions = require('./conversions');
const request = require('request');
const timezone = require('../geocode/timezone.js');
const exec = require('child_process').exec;
const _ = require('lodash');
var astro = {};

function isNumeric(val) {
	if (typeof val == 'number') {
		return val !== NaN;
	} else if (typeof val == 'string') {
		return /^\s*-?\d+(\.\d+)?|\.d+\s*$/.test(val);
	}
	return false;
}



astro.saveChart = (model,callback) => {
  var data = {},objId;
  if (typeof model == 'object') {
    if (model.geo) {
       if (!model.name) {
          model.name = 'unknown';
       }
       if (!model.gender) {
          model.gender = 'unknown';
       }
       if (model.id) {
       	objId = model.id;
       }
       if (typeof model.personId == 'string') {
       		model.newPerson = false;
       } else {
       		model.newPerson = true;
       }
       var personData = {
          userId: model.userId,
          name: model.name
       };
       if (model.chartType == 'birth') {
         if (model.gender) {
           personData.gender = model.gender;
         }
         if (model.dateinfo.gmtOffset) {
          personData.gmtOffset = model.dateinfo.gmtOffset;
         }
         if (model.datetime) {
          personData.dob = new Date(model.datetime);
         }
       }
       if (model.newPerson) {
       	var person = new Person(personData);
       	person.save();
       	data.personId = person._id;
        astro.saveChartRecord(model,data,person,objId,callback);
       } else {
       		Person.findByIdAndUpdate(model.personId,{ $set: personData},(err,pd) => {
       			if (err) {
              callback({valid:false,msg:"Invalid person details"},undefined)
       			} else {
       				person = pd.toObject();
              for (k in personData) {
                person[k] = personData[k];
              }
              data.personId = model.personId;
              astro.saveChartRecord(model,data,person,objId,callback);
       			}
       		});
       		
       }
       
    }
  }
}

astro.getByUserId = (uid,mode,limit,callback) => {
    if (/^\d+/.test(limit)) {
      limit = parseInt(limit);
    } else {
      limit =100;
    }
    var projection;
    switch (mode) {
      case 'full':
        projection = null;
        break;
      default:
        projection = {_id:1,userId:1,personId:1,datetime:1,geo:1,chartType:1,eventTypeId:1,eventTitle:1,tags:1};
        break;
    }
   Chart.find()
   .where('userId').equals(uid)
   .sort('-_id')
   .limit(limit)
   .select(projection)
   .exec((error,items) =>{
      if (items instanceof Array) {
        callback(items);
      } else {
        callback([]);
      }
    });
};

astro.getPersonsByUserId = (uid,limit,callback) => {
    if (/^\d+/.test(limit)) {
      limit = parseInt(limit);
    } else {
      limit =100;
    }
    var projection = null;
   Person.find()
   .where('userId').equals(uid)
   .sort('-_id')
   .limit(limit)
   .select(projection)
   .exec((error,items) =>{
      if (items instanceof Array) {
        callback(items);
      } else {
        callback([]);
      }
    });
};

astro.saveChartRecord = (model,data,person,objId,callback) => {
	for (k in model) {
   	switch (k) {
   		case 'userId':
    	case 'personId':
    	case 'chartType':
    	case 'eventTypeId':
    	case 'eventTitle':
    	case 'notes':
    	case 'tags':
    	case 'datetime':
    	case 'dateinfo':
    	case 'geo':
    	case 'ascendant':
    	case 'mc':
    	case 'armc':
    	case 'vertex':
    	case 'ut':
    	case 'et':
    	case 'delta_t':
    	case 'epsilon_true':
    	case 'nutation':
    	case 'mean_node':
    	case 'true_node':
    	case 'mean_apogee':
    	case 'ayanamsas':
    	case 'houses':
    	case 'bodies':
         		data[k] = model[k];
         		break;
       	}
     }
     if (typeof objId == 'string') {
     		Chart.findByIdAndUpdate(objId, { $set: data}, (err, doc) => {
        if (err) {
        	callback({valid:false, msg:"not found"},undefined);
        } else {
          var json = doc.toObject(), k;
          for (k in data) {
            json[k] = data[k];
          }
          astro.combineRecord(json,person,callback);
        }        
      });
     } else {
        var chart = new Chart(data);
       	chart.save().then((doc) => {
       	  astro.combineRecord(doc,person,callback);
        }, (e) => {
          callback({valid:false,msg:"System error 1"});
      });
  }
}


astro.combineRecord = (doc,person,callback) => {
  if (typeof doc.toObject == 'function') {
    var json = doc.toObject();
  } else {
    var json = doc;
  }
  if (person.toObject) {
    json.person = person.toObject();
  } else {
    json.person = person;
  }
  callback(undefined,json);
}

astro.processChartRequest = (query,callback) => {
  var locParts = query.lc.split(','),
  location = {
    lat: locParts[0],
    lng: locParts[1],
    alt: locParts[2]
  },
  datetime = query.dt;
  timezone.request(location,datetime,'position',(error,tData) => {

    if (!error) {
      var dt = conversions.dateOffsetsToISO(datetime,tData.gmtOffset);

      query.dt = dt;
      query.tz = tData.zoneName;
      query.gmtOffset = tData.gmtOffset;
      astro.fetchChartData(query, (error, aData) => {
        if (error) {
          callback({valid:false,msg:"Invalid datetime or location parameters"});
        } else {
          if (query.userId) {
          	aData.userId = query.userId;
          }
          aData.geo = location;
          if (query.address) {
            aData.geo.address = query.address;
          }
          aData.datetime = query.dt;
          aData.dateinfo = {
            zone: query.tz,
            gmtOffset: query.gmtOffset
          };
          if (query.name) {
            aData.name = query.name;
          }
          if (query.chartType) {
            aData.chartType = query.chartType;
          } else {
            aData.chartType = 'birth';
          }
          if (query.gender) {
            aData.gender = query.gender;
          }
          if (query.newPerson) {
            aData.newPerson = true;
          } else {
          	aData.newPerson = false;
          }
          if (query.id) {
          	aData.id = query.id;
          }
          if (query.personId) {
          	aData.personId = query.personId;
          }

          astro.saveChart(aData, (error,cData) => {
            if (error) {
              callback(undefined,aData);
            } else {
              callback(undefined,cData);
            }
          });
        }
      });
    } else {
      callback({valid:false,msg:"Cannot match timezone"},undefined);
    }
  });
}

astro.savePerson = (params,callback) => {
	var data = {
	  name: params.name,
	  gender: params.gender
	};
	if (params.dob) {
	  data.dob = new Date(params.dob);
	}
	if (params.groups) {
	  var groups = params.groups.split(',');
	  if (groups.length > 0) {
	    data.groups = params.groups;
	  }
	}
	if (params.public) {
	  data.public = params.public;
	}
	if (params.notes) {
	  if (typeof params.notes == 'string') {
	    var notes = params.notes.trim();
	    if (notes.length>1) {
	      data.notes = params.notes;
	    }
	  }
	}
	var person = new Person(data);
	person.save();
  if (person._id) {
    callback(null,person);
  } else {
    callback({valid:false,msg:"Could not save person"},null);
  }
}

astro.saveUser = (query,callback) => {
  var data = {
    username: query.username,
    password: query.password,
    screenname: query.screenname,
    isAdmin: false,
    authType: "email",
    created: new Date(),
    active: false
  };
  User.find({username:data.username}, (err,user) => {
    
    if (user instanceof Array && user.length>0) {
      callback({valid:false,msg:"A user with the same email address already exists."},undefined);
    } else {
      var user = new User(data);
      user.save().then((doc) => {
        callback(undefined,doc);

      }, (e) => {
        callback(e,undefined);
      });
    }
  });
  
}

astro.saveEventType = (query,callback) => {
  var data = {
    name: query.name,
  };
  if (query.notes) {
    data.notes = query.notes;
  }
  if (query.public) {
    data.public = query.public;
  }
  var et = new EventType(data);
  et.save();
  if (et._id) {
    data._id = et._id;
    callback(undefined,data);
  } else {
    callback({valid:false,msg:"Could not save event type"},undefined);
  }
}



astro.results = (res,page) => {
  Nested.find().then((data) => {
    res.send({
      num: data.length,
      page: page,
      items: data
    });
  }).catch((e) => {
    res.status(400).send();
  });
};



astro.download = (id,callback) => {
  var cmd = 'phantomjs screengrab.js ' + id;
  if (cmd.length > 4) {
  	var child = exec(cmd, (error, stdout, stderr) => {
	  	callback({href:'/screengrab-' + id + '.pdf'});
	});
  }
}

astro.getById = (id,callback) => {
	Chart.findById(id).then((doc) => {
    var matched = false;
    if (typeof doc == 'object') {
      if (doc.houses) {
        matched = true;
      	Person.findById(doc.personId).then((person) => {
          astro.combineRecord(doc,person,callback);
        }).catch((e) => {
          callback(undefined,doc.toObject())
        });
      }
    }
    if (!matched) {
      callback({valid:false,msg:"No matching records"},undefined);
    }
  }).catch((e) => {
    callback({valid:false,msg:"System error"},undefined)
  });
}


var preParseAstro = function(data) {
  var parsed = {}, k;
  if (data.values) {
    for (k in data.values) {
      parsed[k] = data.values[k];
    }
  }
  if (data.coords) {
    for (k in data.coords) {
      parsed[k] = data.coords[k];
    }
  }
  if (data.bodies) {
    parsed.bodies = [];
    var i=0,b,body;
    var bns = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto","ketu","rahu","pallas","ceres","juno","vesta","chiron","pholus"];
    for (;i<bns.length;i++) {
    	if (data.bodies[bns[i]]) {
    		body = data.bodies[bns[i]];
    		b = {key:bns[i]};
	    	for (k in body) {
	    		b[k] = body[k];
	    	}
	  		parsed.bodies.push(b);
    	}
    	
    	
  	}
  }

  if (data.ayanamsas) {
  	parsed.ayanamsas =  [];
  	for (k in data.ayanamsas) {
  		parsed.ayanamsas.push({
  			num: parseInt(k),
  			value: data.ayanamsas[k]
  		});
  	}
  }
  if (data.houses) {
    parsed.houses =  [];
    var hss = ["W","E","D","S","O","P","K","B","C","M","R","T","A","X","G","H"];
    for (i=0;i<hss.length;i++) {
    	if (data.houses[hss[i]]) {
    		parsed.houses.push({
  			key: hss[i],
  			values: data.houses[hss[i]]
  		});
    	}
  		
  	}
  }
  parsed.aspects =  data.aspects;
  return parsed;
};

astro.fetchFromBackend = (query,callback) => {
  let script_dir = __dirname + '/../scripts/';
  var datetime="",location="";
  if (query.dt && query.lc) {
    if (/^\s*[21][7890]\d\d-[01]\d-[0123]\dT[012]\d:[0-5]\d:[0-5]\d/.test(query.dt)) {
      datetime = query.dt;
    }
    if (/^-?\d+\.\d+,-?\d+\.\d+,\d+/.test(query.lc)) {
      location = query.lc;
    }
  }
  if (datetime.length > 5 && location.length > 5) {
    var cmd = script_dir + 'astro ' + script_dir +'astroiq-all.sh ' + datetime + ' ' + location;

    if (cmd.length > 4) {
      child = exec(cmd, (error, stdout, stderr) => {
        if (stderr) {
          res.send({valid:false,msg:"Server error"});
        } else {
          let json = JSON.parse(stdout);
          json.valid = false;
          if (json.values) {
            json.valid = true;
          }
          callback(null,json);
        }
      });
    }
  } else {
    json = {valid:false,msg:"Invalid datetime or location parameters"};
    callback(json,null);
  }
};

astro.fetchChartData = (query,callback) => {
	astro.fetchFromBackend(query,(error,result) => {
		if (error) {
			callback(error,null);
		} else {
			var data = preParseAstro(result);
			callback(null,data);
		}
	});
};

astro.saveSettings = function(query,res) {
	res.send({valid:true});
};

module.exports = astro;