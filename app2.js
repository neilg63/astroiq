const sys = require('util');
const express = require("express");
const pug = require('pug');
const app = express();
const geocode = require('./geocode/geocode.js');
const textutils = require('./text-utils.js');
const astro = require('./astroapp.js');
const exec = require('child_process').exec;
var child;


String.prototype.cleanCommand = function() {
	return this.split("|").shift().split(">").shift().split('&').shift().split("<").shift();
}

app.get('/sweph', function(req, res){ 

     var cmd = astro.composeSwetestQuery(req.query);
     if (cmd.length > 4) {
	  	  cmd = cmd.cleanCommand();
	  	  if (cmd.length > 4) {
		     child = exec(cmd, function (error, stdout, stderr) {
			  var debug = false;
			  if (req.query.debug) {
			  	if (req.query.debug == 1) {
			  		debug = true;
			  	}
			  }
			  var data = astro.fetchData(stdout,debug);
			  if (debug) {
			  	data.swetest.cmd = cmd;
			  	data.swetest.raw = `<pre>${stdout}</pre>`;
			  }

			  if (error !== null) {
			    data = {"valid": false,"msg": "Server error"};
			  } else {
			  	data.valid = true;
			  }
			  var ayCmd = astro.composeSwetestQueryAyanamsa(req.query);
			  if (ayCmd.length > 4) {
			  	  ayCmd = ayCmd.cleanCommand();
				  child = exec(ayCmd, function (error, stdout, stderr) {
				  	var ayData =  astro.parseOutput(stdout,debug);
				  	data.ayanamsa = ayData.ayanamsa;
				  	res.send(data);
				  });
			  }
			  
			});
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
    res.sendfile('./chart.html');
});

app.get('/zodiac', function(req, res) {
    res.sendfile('./chart.html');
});

app.get('/snap', function(req, res) {
    res.sendfile('./chart.html');
});

app.get('/pug', function(req, res) {
	const page = pug.compileFile(__dirname + '/templates/pug.pug');
    res.send(page({
    	title: "Test title"
    }));
});

app.get('/command', function(req, res) {
    res.sendfile('./swetest.html');
});

app.get('/geocode/:address', (req,res) => {
	geocode.geocodeAddress(req.params.address, (errorMessage, result) => {
		if (errorMessage){
			res.status(404).send({valid:false,message:errorMessage});
		} else {
			result.valid = true;
			res.send(result);
		}
	});
});

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

