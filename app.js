var sys = require('util'),
express = require("express")
app = express(),
textutils = require('./text-utils.js'),
astro = require('./astroapp.js'),
exec = require('child_process').exec;
var child;

app.get('/sweph', function(req, res){ 

     var cmd = astro.composeSwetestQuery(req.query);
     child = exec(cmd, function (error, stdout, stderr) {
	  var debug = false;
	  if (req.query.debug) {
	  	if (req.query.debug == 1) {
	  		debug = true;
	  	}
	  }
	  // var data = astro.parseOutput(stdout,debug);
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
	  //console.log(ayCmd);
	  child = exec(ayCmd, function (error, stdout, stderr) {
	  	var ayData =  astro.parseOutput(stdout,debug);
	  	data.ayanamsa = ayData.ayanamsa;
	  	res.send(data);
	  });
	  
	});
});

app.get('/swetest-backend',function(req,res) {
	if (req.query.cmd) {
		var cmd = req.query.cmd,
			valid = false,
			msg = "Please enter a valid command";
		if (typeof cmd == 'string') {
			cmd = cmd.split("|").shift().split(">").shift().split('&').shift().split("<").shift();
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
});

app.use('/js', express.static('js'));

app.use('/css', express.static('css'));

app.use('/svgs', express.static('svgs'));

app.get('/zodiac', function(req, res) {
    res.sendfile('./zodiac.html');
});

app.get('/', function(req, res) {
    res.sendfile('./swetest.html');
});

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});