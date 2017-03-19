const sys = require('util');
const express = require("express");
const bodyParser = require("body-parser");
const config = require('./config/config');
const {mongoose} = require('./db/mongoose');
const {Nested} = require('./models/nested');
const {Person} = require('./models/person');
const {User} = require('./models/user');
const {Geo} = require('./models/geo');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
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

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

const admin = require('./routes/admin');
app.use('/admin', admin);


// Makes the user object global in all views
app.get('*', function(req, res, next) {
  // put user into res.locals for easy access from templates
  res.locals.user = req.user || null;

  if(req.user){
    res.locals.type = req.user.type;
  }
  next();
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



app.use('/js', express.static('js'));

app.use('/css', express.static('css'));

app.use('/icomoon', express.static('icomoon'));

app.use('/svgs', express.static('svgs'));

app.get('/', function(req, res) {
   const page = pug.compileFile(tplDir + '/aiq.pug');
    res.send(page(variables));
});

app.get('/home', function(req, res) {
  const page = pug.compileFile(tplDir + '/aiq.pug');
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
  if (req.body.userId && req.body.name) {
    astro.saveEventType(req.body,(error,eventType) => {
      if (error) {
        res.send(error);
      } else {
        res.send(eventType);
      }
    });
  } else {
    res.send({valid:false,msg:"No name or user id specified"});
  }
});

app.post('/login', passport.authenticate('local'), function(req, res, next) {
    var ud={}, k; 
    if (req.user) {
      for (k in req.user) {
        switch (k) {
          case '_id':
            ud.id = req.user[k];
            break;
          case 'username':
          case 'screenname':
          case 'userGroups':
          case 'created':
          case 'isAdmin':
          case 'active':
            ud[k] = req.user[k];
            break;
        }
      }
    }
    console.log(req.user);
    var data = {
      msg: 'You are now logged in',
      user: ud
    };
    res.send(data);
});

passport.serializeUser(function(user, done) {
  done(null, user._id);
});


passport.deserializeUser(function(id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if (err) throw err;
      if(!user){
        return done(null, false, { message: 'Unknown user ' + username }); 
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
          if (err) return done(err);
          if(isMatch) {
            return done(null, user);
          } else {
            // Success Message
            return done(null, false, { message: 'Invalid password' });
          }
      });
    });
  }
));

app.post('/save-user', (req,res) => {
  if (req.body.username && req.body.password && req.body.screenname) {
    astro.saveUser(req.body,(error,user) => {
      if (error) {
        res.send(error);
      } else {
        var ud = {};
        for (k in user) {
          switch (k) {
            case "_id":
              ud.id = user[k];
              break;
            case 'username':
            case 'screenname':
            case 'isAdmin':
            case 'active':
              ud[k] = user[k];
              break;
          }
        }
        res.send(ud);
      }
    });
  } else {
    res.send({valid:false,msg:"No user name, screen name or password specified"});
  }
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

/* Legacy services */
/*app.get('/ayanamsa', function(req, res){
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
});*/
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

var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

