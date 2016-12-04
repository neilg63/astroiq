const astro = require('./../astroapp.js');


var strDg = `149°41'51.4839`;

var dg = astro.toDegrees(strDg);

console.log(dg);