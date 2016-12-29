const sys = require('util');
const express = require("express");
const {mongoose} = require('./server/db/mongoose');
const {Nested} = require('./server/models/nested');
const {Geo} = require('./server/models/geo');
const pug = require('pug');
const app = express();
const geocode = require('./geocode/geocode.js');
const textutils = require('./text-utils.js');
const astro = require('./astroapp.js');
const exec = require('child_process').exec;
var child;


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

app.use('/svgs', express.static('svgs'));

app.get('/', function(req, res) {
   const page = pug.compileFile(__dirname + '/templates/index.pug');
    res.send(page({
    	title: "AstroIQ Demo"
    }));
});

app.get('/zodiac', function(req, res) {
    const page = pug.compileFile(__dirname + '/templates/index.pug');
    res.send(page({
    	title: "AstroIQ Demo"
    }));
});

app.get('/command', function(req, res) {
    res.sendfile('./swetest.html');
});

app.get('/geocode/:address', (req,res) => {
  var searchString = req.params.address.despace();
  Geo.findOne({
    string: searchString.toLowerCase()
  }).then((doc) => {
    var matched = false;

    if (doc !== null) {
      var data = {};
      data.lat = doc.location.lat;
      data.lng = doc.location.lng;
      if (doc.address) {
        data.address = doc.address;
      } else {
        data.address = doc.string.capitalize();
      }
      data.type = doc.location_type;
      data.components = doc.address_components;
      matched = true;
      data.valid = true;
      res.send(data);
    }
    if (!matched) {
      geocode.fetchData(searchString, res);
    }
  }).catch((e) => {
    res.send(e);
  });
	
});

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

