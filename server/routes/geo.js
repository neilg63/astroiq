const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bodyParser = require("body-parser");
const config = require('./../config/config');
const {mongoose} = require('./../db/mongoose');
const {Geo} = require('./../models/geo');
const geocode = require('./../geocode/geocode.js');
const geonames = require('./../geocode/geonames.js');
const geoplugin = require('./../geocode/geoplugin.js');
const arcgis = require('./../geocode/arcgis.js');
const timezone = require('./../geocode/timezone.js');
const textutils = require('./../lib/text-utils.js');
const conversions = require('./../lib/conversions.js');


router.get('/code/:address', (req,res) => {
  var searchString = req.params.address.despace();
  geocode.matchLocation(searchString,res);
});

router.get('/arcgis/:address', (req,res) => {
  arcgis.match(req.params.address,(error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
});

router.get('/tz-match/:first/:second/:date', (req,res) => {
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

router.get('/place-match/:search/:bias', (req,res) => {
  geonames.request(req.params.search,req.params.bias,'filtered',(error,data) => {
      if (error) {
        res.status(404).send(data);
      } else {
        res.status(200).send(data);
      }
    });
});

router.get('/locate/:lat/:lng', (req,res) => {
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

router.get('/ip', (req,res) => {
  geoplugin.request(req,(error,data) => {
      if (error) {
        res.status(404).send(data);
      } else {
        res.status(200).send(data);
      }
    });
});

router.get('/nearby/:coords', (req,res) => {
  var coords = req.params.coords.despace();
  geocode.fetchHospitals(coords, res);
});

module.exports = router;