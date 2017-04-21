const sys = require('util');
const express = require("express");
const bodyParser = require("body-parser");
const config = require('./config/config');
const {mongoose} = require('./db/mongoose');
const {Person} = require('./models/person');
const {User} = require('./models/user');
const {Geo} = require('./models/geo');
const passport = require('passport');
const session = require('express-session');
const Cookies = require( "cookies" );
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


var loadApp = (res) => {
  const page = pug.compileFile(tplDir + '/aiq.pug');
   astro.publicData( (data) => {
    if (variables.data) {
      _.merge(variables.data,{public:data});
      variables.dataVars = 'var vars = ' + JSON.stringify(variables.data);
      astro.coreEventTypes(variables,data.userId,function(variables) {
        res.send(page(variables));
      });
    } else {
      res.send(page(variables));
    }
    
  });
};

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
const api = require('./routes/api');
app.use('/api', api);
const geo = require('./routes/geo');
app.use('/geo', geo);

// Makes the user object global in all views
app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  if(req.user){
    res.locals.type = req.user.type;
  }
  next();
});

app.get('/person-names-match', function(req, res){ 
  Person.find({name:RegExp('^' +req.query.q,'i'),userId:req.query.uid}, {_id:1,name:1}, { sort: 'name'}, (err,user) => {
    var data = [];
    if (!err) {
      data = _.sortedUniqBy(user,'name');
    }
    res.send(data);
  });
});

app.get('/person-names-all/:uid', function(req, res){ 
  Person.find({name:/^\w+/,userId:req.params.uid}, {_id:1,name:1}, { sort: 'name'}, (err,user) => {
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


app.get('/chart-download/:id', function(req, res){ 
  astro.download(req.params.id,function(data){
    res.send(data);
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


app.use('/js', express.static('js'));

app.use('/css', express.static('css'));

app.use('/icomoon', express.static('icomoon'));

app.use('/svgs', express.static('svgs'));

app.get('/', function(req, res) {
   loadApp(res);
});

app.get('/home', function(req, res) {
  loadApp(res);
});

app.get('/old', function(req, res) {
   const page = pug.compileFile(tplDir + '/astro.pug');
   res.send(page(variables));
});

app.get('/astro', function(req, res) {
    loadApp(res);
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
    var cookies = new Cookies( req, res, { "keys": ['xyz'] } );
    cookies
      .set( "uid", ud.id, { httpOnly: false } )
      .set( "isAdmin", ud.isAdmin, { signed: true } );
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


var port = process.env.PORT || 9862;
app.listen(port, function() {
	console.log("Listening on " + port);
});

