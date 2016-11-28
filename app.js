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
	  var cmd = astro.composeSwetestQueryAyanamsa(req.query);
	  child = exec(cmd, function (error, stdout, stderr) {
	  	var ayData =  astro.parseOutput(stdout,debug);
	  	data.ayanamsa = ayData.ayanamsa;
	  	res.send(data);
	  });
	  
	});
});

app.get('/ayanamsa', function(req, res){ 

     var cmd = astro.composeSwetestQueryAyanamsa(req.query);
     child = exec(cmd, function (error, stdout, stderr) {
	  //sys.print('stdout: ' + stdout);
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

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});