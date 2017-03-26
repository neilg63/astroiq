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

router.post('/chart/delete', function(req, res) {
	var login = checkLogin(res.req);
   if (login.valid) {
	 User.findOneAndRemove({_id:req.body.id,userId:req.body.userId},(err, data) => {
   if (err) {
	    res.send({valid:false,msg:"Could not find user"});
	  } else {
	    res.send(data);
	  }
	});
	} else {
		res.send({valid:false,msg:"Could not loggedin"});
	}
});

router.get('/chart/:id', function(req, res){ 
  astro.getById(req.params.id,function(data){
    res.send(data);
  });
});


module.exports = router;