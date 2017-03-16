const sys = require('util');
const express = require("express");
const bodyParser = require("body-parser");
const config = require('./config/config');
const {mongoose} = require('./db/mongoose');
const {Nested} = require('./models/nested');
const {Person} = require('./models/person');
const {Geo} = require('./models/geo');
const pug = require('pug');
const app = express();
const _ = require('lodash');
const geocode = require('./geocode/geocode.js');
const geonames = require('./geocode/geonames.js');
const geoplugin = require('./geocode/geoplugin.js');
const arcgis = require('./geocode/arcgis.js');
const timezone = require('./geocode/timezone.js');
const textutils = require('./lib/text-utils.js');
const conversions = require('./lib/conversions.js');
const astro = require('./lib/astroapp.js');
const dasha = require('./lib/dasha.js');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const variables = require('./../content/variables.js');
const tplDir = __dirname + '/../templates/';

app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/sweph', function(req, res){ 
  var debug = false,swCoords;
  if (req.query.debug) {
    if (req.query.debug == 1) {
      debug = true;
    }
  }

  if (req.query.topo) {
    swCoords = req.query.topo;
  } else if (req.query.geopos) {
    swCoords = req.query.geopos;
  }
  if (swCoords !== null) {
    let coords = conversions.swephTopoStrToLatLng(swCoords),
        datetime = conversions.euroDatePartsToISOString(req.query.b,req.query.ut);
   
    timezone.request(coords,datetime,'position',(error,tData) => {
      if (!error) {
        var dt = conversions.dateOffsetsToEuroDateTimeParts(datetime,tData.gmtOffset);
        req.query.b = dt.b;
        req.query.ut = dt.ut;
        req.query.tz = tData.zoneName;
        req.query.gmtOffset = tData.gmtOffset;
      }
      astro.get(req.query,res);
    });
  } else {
    res.send({valid: false});
  }

});

app.get('/astro-json',(req,res) => {
  astro.processChartRequest(req.query,(error,result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      res.status(200).send(result);
    }
  });
});


app.get('/person-names-match', function(req, res){ 
  Nested.find({name:RegExp('^' +req.query.q,'i')}, {_id:1,name:1}, { sort: 'name'}, (err,user) => {
    var data = [];
    if (!err) {
      data = _.sortedUniqBy(user,'name');
    }
    res.send(data);
  });
});

app.get('/person-names-all', function(req, res){ 
  Nested.find({name:/^\w+/}, {_id:1,name:1}, { sort: 'name'}, (err,user) => {
    var data = [];
    if (!err) {
      var toUser = (u) => {
        return {'id':u._id,name:u.name,hidden:true};
      }
      data = _.map(_.sortedUniqBy(user,'name'),toUser);
    }
    res.send(data);
  });
});


app.get('/sweph-item/:id', function(req, res){ 
  astro.getById(req.params.id,function(data){
    res.send(data);
  });
});

app.get('/sweph-download/:id', function(req, res){ 
  astro.download(req.params.id,function(data){
    res.send(data);
  });
});

app.get('/dasha-json',(req,res) => {
  dasha.calc(req.query,(error,data) => {
    if (error) {
      res.status(404).send(error);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get('/swetest-backend',function(req,res) {
	if (req.query.cmd) {
		var cmd = req.query.cmd,
			valid = false,
			msg = "Please enter a valid command";
		if (typeof cmd == 'string') {
			cmd = cmd.cleanCommand();
			if (cmd.length>1) {
					cmd = cmd.trim();
				
				if (cmd !== 'whoami') {
					if (cmd.startsWith('-')) {
						var cmd = 'swetest ' + cmd;
						valid = true;
					} else {
						msg = "Swetest command options must begin with a hyphen (-)";
					}
				} else {
					valid = true;
				}
			}
		}
		if (valid) {

			child = exec(cmd, function (error, stdout, stderr) {
			  var data = {};
			  if (!stderr) {
			  	data.output = stdout;
			  	data.valid = true;
			  } else {
			  	data.output = stderr;
			  	data.valid = true;
			  }
			  res.send(data);
			});
		} else {
			var data = {
				valid: true,
				output: msg
			};
			res.send(data);
		}
	}
});

app.get('/server-datetime', (req,res) => {
  var data = {}, dt = new Date();
  data.string = dt.toString();
  data.iso = dt.toISOString();
  data.year = dt.getFullYear();
  data.month = dt.getMonth() + 1;
  data.day = dt.getDate();
  data.hours = dt.getHours();
  data.minutes = dt.getMinutes();
  data.seconds = dt.getSeconds();
  res.send(data);
});

app.get('/tz-match/:first/:second/:date', (req,res) => {
  var data = {}, valid = false,inData,type;
  if (req.params.date == 'now') {
    var d = new Date();
  } else {
    var d = new Date(req.params.date);
  }
  if (d instanceof Date) {
    let numRgx = new RegExp('^\s*-?[0-9]+(\\.[0-9]+)?\s*$');
    if (numRgx.test(req.params.first) && numRgx.test(req.params.second)) {
       type = 'position';
       inData = {
          lat: req.params.first,
          lng: req.params.second
       };
       valid = true;
    } else if (req.params.first.length>1 && req.params.second.length>1) {
      type = 'zone';
      valid = true;
      inData = `${req.params.first}/${req.params.second}`;
    }
  }
  if (valid) {
    timezone.request(inData,d,type,(error,data) => {
      if (error) {
        res.status(404).send(data);
      } else {
        res.status(200).send(data);
      }
    });
  } else {
    res.send(data);
  }
});

app.get('/geomatch/:search/:bias', (req,res) => {
  geonames.request(req.params.search,req.params.bias,'filtered',(error,data) => {
      if (error) {
        res.status(404).send(data);
      } else {
        res.status(200).send(data);
      }
    });
});

app.get('/geolocate/:lat/:lng', (req,res) => {
  let coords = {
    lat: req.params.lat,
    lng: req.params.lng
  }
  geonames.mapCoords(coords,(error,data) => {
    if (error) {
      res.status(404).send(data);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get('/geoip', (req,res) => {
  geoplugin.request(req,(error,data) => {
      if (error) {
        res.status(404).send(data);
      } else {
        res.status(200).send(data);
      }
    });
});

app.post('/git/:cmd', (req,res) => {
  if (req.body.password) {
    var password = req.body.password,
      cmd = req.params.cmd,
      valid = false,
      msg = "Cannot validate your password.";
    
    var compPass = 'vimshottari',
      dt = new Date(),
      dtStr = ';' + ( dt.getHours() + dt.getDate() ),
      matchedStr = compPass + dtStr,
      valid = password === matchedStr;

    if (valid) {
      var cmds = [];
      switch (cmd) {
        case 'pull':
          cmds = ['pull','origin','dev'];
          break;
        case 'log':
          cmds = ['log'];
          break;
        case 'status':
          cmds = ['status'];
          break;
      }
      var process = spawn('git',cmds);
      var buf='', tmp='';
      process.stdout.on('data', (data) => {
        tmp = data.toString();
        if (typeof tmp == 'string') {
          if (tmp.length>0) {
            buf += tmp.split('<').join('&lt;').split('>').join('&gt;');
          }
        }
        
      });
      process.on('close', (data) => {
        res.send({
          valid: true,
          output: buf
        });
      });
    } else {
      var data = {
        valid: true,
        output: msg
      };
      res.send(data);
    }
  }
});

app.get('/ayanamsa', function(req, res){
     var cmd = astro.composeSwetestQueryAyanamsa(req.query);
     if (cmd.length > 4) {
	     cmd = cmd.cleanCommand();
	     if (cmd.length > 4) {
	     	child = exec(cmd, function (error, stdout, stderr) {
			  var data = astro.parseOutput(stdout,debug);

			  res.setHeader('Content-Type', 'application/json');
			  if (error !== null) {
			    data = {"valid": false,"msg": "Server error"};
			  } else {
			  	data.valid = true;
			  	data.msg = "OK";
			  }
			  res.send(data);
			});
	     }
	}
});

app.use('/js', express.static('js'));

app.use('/css', express.static('css'));

app.use('/icomoon', express.static('icomoon'));

app.use('/svgs', express.static('svgs'));

app.get('/', function(req, res) {
   const page = pug.compileFile(tplDir + '/astro.pug');
    res.send(page(variables));
});

app.get('/home', function(req, res) {
   const page = pug.compileFile(tplDir + '/astro.pug');
    res.send(page(variables));
});

app.get('/astro', function(req, res) {
   const page = pug.compileFile(tplDir + '/astro.pug');
   res.send(page(variables));
});

app.get('/new', function(req, res) {
    const page = pug.compileFile(tplDir + '/aiq.pug');
    res.send(page(variables));
});

app.get('/chart', function(req, res) {
    const page = pug.compileFile(tplDir + '/astrochart.pug');
    res.send(page(variables));
});

app.get('/about', function(req, res) {
    const page = pug.compileFile(tplDir + '/about.pug');
    res.send(page(variables));
});

app.get('/command', function(req, res) {
    res.sendfile('./swetest.html');
});

app.get('/settings', function(req, res) {
    astro.saveSettings(req.query,res);
});

app.get('/geocode/:address', (req,res) => {
  var searchString = req.params.address.despace();
  geocode.matchLocation(searchString,res);
});

app.get('/arcgis/:address', (req,res) => {
  arcgis.match(req.params.address,(error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
});

app.post('/save-person', (req,res) => {
  if (req.body.name && req.body.gender) {
    astro.savePerson(req.body,(error,person) => {
      if (error) {
        res.send(error);
      } else {
        res.send(person);
      }
    });
  } else {
    res.send({valid:false,msg:"No name or gender specified"});
  }
  
});

app.post('/save-event-type', (req,res) => {
  var data = {
    name: req.query.name,
  };
  if (req.query.notes) {
    data.notes = req.query.notes;
  }
  
  if (req.query.public) {
    data.dob = req.query.public;
  }
  var et = new EventType(data);
  et.save();
  res.send(et);
});

app.post('/save-group', (req,res) => {
  var data = {
    name: req.query.name,
  };
  if (req.query.notes) {
    data.notes = req.query.notes;
  }
  if (req.query.parent) {
    if (/^[0-9a-e]+$/.test(req.query.parent)) {
      data.parent = req.query.parent;
    }
  }
  var group = new Group(data);
  group.save();
  res.send(group);
});

app.post('/save-tag', (req,res) => {
  var data = {
    name: req.query.name,
  };
  if (req.query.notes) {
    data.notes = req.query.notes;
  }
  if (req.query.parent) {
    if (/^[0-9a-e]+$/.test(req.query.parent)) {
      data.parent = req.query.parent;
    }
  }
  var group = new Tag(data);
  group.save();
  res.send(group);
});

app.get('/nearby/:coords', (req,res) => {
  var coords = req.params.coords.despace();
  geocode.fetchHospitals(coords, res);
});

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

