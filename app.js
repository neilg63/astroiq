const sys = require('util');
const express = require("express");
const bodyParser = require("body-parser");
const {mongoose} = require('./server/db/mongoose');
const {Nested} = require('./server/models/nested');
const {Geo} = require('./server/models/geo');
const pug = require('pug');
const app = express();
const geocode = require('./geocode/geocode.js');
const geonames = require('./geocode/geonames.js');
const geoplugin = require('./geocode/geoplugin.js');
const timezone = require('./geocode/timezone.js');
const textutils = require('./lib/text-utils.js');
const astro = require('./lib/astroapp.js');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const variables = require('./content/variables.js');
var child;

app.enable('trust proxy');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/sweph', function(req, res){ 
  var cmd = astro.composeSwetestQuery(req.query);
  var debug = false;
  if (req.query.debug) {
    if (req.query.debug == 1) {
      debug = true;
    }
  }
  if (cmd.length > 4) {
	  cmd = cmd.cleanCommand();
	  if (cmd.length > 4) {
      astro.fetch(cmd,res,req.query, debug);
		}
	}
});

app.get('/results/:page', function(req, res){ 
  var page = req.params.page.toInt();
  astro.results(res,page);
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
   const page = pug.compileFile(__dirname + '/templates/index.pug');
    res.send(page(variables));
});

app.get('/zodiac', function(req, res) {
    const page = pug.compileFile(__dirname + '/templates/index.pug');
    res.send(page(variables));
});

app.get('/command', function(req, res) {
    res.sendfile('./swetest.html');
});

app.get('/geocode/:address', (req,res) => {
  var searchString = req.params.address.despace();
  geocode.matchLocation(searchString,res);
});

app.get('/nearby/:coords', (req,res) => {
  var coords = req.params.coords.despace();
  geocode.fetchHospitals(coords, res);
});

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

