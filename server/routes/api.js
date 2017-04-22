const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Cookies = require( "cookies" );
const textutils = require('./../lib/text-utils.js');
const moment = require('moment');
const variables = require('./../../content/variables.js');
const tplDir = __dirname + '/../../templates/';
const {User} = require('./../models/user');
const {Chart} = require('./../models/chart');
const {Person} = require('./../models/person');
const astro = require('./../lib/astroapp.js');
const dasha = require('./../lib/dasha.js');

var checkLogin = (req,res) => {
  var cookies = new Cookies( req, res, { "keys": ['xyz'] } );
  req.uid = cookies.get( "uid", { signed: true } );
  var data = {
  	valid: false,
  	uid: ""
  };
  if (typeof req.uid == 'string') {
  	if (req.uid.length>8) {
  		data.uid = req.uid;
  		data.isAdmin = req.isAdmin;
  		data.valid = true;
  	}
  }
  return data;
};

router.post('/astro',(req,res) => {
  if (req.body.lc && req.body.dt) {
    astro.processChartRequest(req.body,(error,result) => {
      if (error) {
        res.status(404).send(error);
      } else {
        res.status(200).send(result);
      }
    });
  } else {
    res.status(404).send({valid:false,msg:"invalid parameters"});
  }
});

router.get('/dasha',(req,res) => {
  dasha.calc(req.query,(error,data) => {
    if (error) {
      res.status(404).send(error);
    } else {
      res.status(200).send(data);
    }
  });
});

router.get('/dasha-person',(req,res) => {
  if (req.query.personId && req.query.ayanamsa) {
    Chart.findOne({personId:req.query.personId,chartType:'birth'}).sort({_id:-1}).exec((err,data) => {
      var valid = false,params={};
      if (!err && typeof data == 'object') {
        params.dt = moment.utc(data.datetime).format('YYYY-MM-DD\THH:mm:ss');
        if (data.bodies) {
          var body = _.find(data.bodies,(b)=> { return b.key == 'moon'});
          if (data.ayanamsas) {
            var ayNum = parseInt(req.query.ayanamsa),
            ayMatched = _.find(data.ayanamsas,(b)=> { return b.num === ayNum}),
            mode = 'topo',
            ayanamsa = 0;
            if (req.query.mode) {
              mode = req.query.mode;
            }
            if (typeof ayMatched == 'object') {
              ayanamsa = parseFloat(ayMatched.value);
            }
            valid = true;
          }
        }
      } 
      if (!valid) {
        res.status(404).send({valid:false,msg:"Cannot match person's birth chart"});
      } else {
        switch (mode) {
          case 'geo':
            if (body.glng) {
              params.lng = body.glng;
            } else {
              params.lng = body.lng;
            }
            break;
          default:
            params.lng = body.lng;
            break;
        }
        params.lng = ((params.lng - ayanamsa) + 360) % 360;
        dasha.calc(params,(error,dd) => {
          if (error) {
              res.status(404).send(error);
          } else {
            dd.mode = mode;
            dd.ayanamsa = ayanamsa;
            dd.ayanamsaNum = ayNum;
            dd.geo = data.geo;
            dd.dateinfo = data.dateinfo;
            res.status(200).send(dd);
          }
        });
      }
    });
  }
  
});

router.post('/chart/delete', function(req, res) {
	var login = checkLogin(res.req);
   if (login.valid) {
   Chart.findOneAndRemove({_id:req.body.id,userId:req.body.userId},(err, data) => {
   if (err) {
	    res.send({valid:false,msg:"Could not find user"});
	  } else {
      if (!data) {
        data = {valid:false,msg:"Could not find user"};
      }
	    res.send(data);
	  }
	});
	} else {
		res.send({valid:false,msg:"Not logged in"});
	}
});

router.get('/chart/:id', function(req, res){ 
  astro.getById(req.params.id,function(data){
    res.send(data);
  });
});

router.get('/charts/:uid/:mode/:limit', function(req, res){ 
  var login = checkLogin(res.req), data = {records:[],persons:[]};
  if (login.valid && login.uid == req.params.uid) {
	  astro.getByUserId(req.params.uid,req.params.mode,req.params.limit,(records) => {
		  data.num_records = records.length;
		  data.records = records;
		  res.send(data);
	  });
  } else {
  	res.send(data);
  }
  
});

router.post('/person/save', (req,res) => {
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

router.post('/event-type/save', (req,res) => {
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

router.post('/group/save', (req,res) => {
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

router.post('/tag/save', (req,res) => {
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

router.get('/settings', function(req, res) {
    astro.saveSettings(req.query,res);
});


module.exports = router;