const astro = require('./../lib/astroapp.js'),
textutils = require('./../lib/text-utils.js');


var strDg = `-149°41'51.4839`;

var dg = astro.toDegrees(strDg);

console.log(dg);

/*var dg = astro.coordsStringToHouseParameters(`282° 6'46.9650   -0°32'24.2779282`);

console.log(dg);*/

var m = {
	houses: {
		1: 170.9480963611111,
		2: 200.9480963611111,
		3: 230.9480963611111,
		4: 260.94809636111114,
		5: 290.94809636111114,
		6: 320.94809636111114,
		7: 350.94809636111114,
		8: 20.948096361111112,
		9: 50.948096361111105,
		10: 80.94809636111111,
		11: 110.94809636111111,
		12: 140.9480963611111
	}
}

var arrHouses = Object.keys(m.houses).map((key) => m.houses[key]),
maxHouseValue = Math.max.apply(null,arrHouses);

const stdout = `swetest -b28.06.1961 -ut11.25 -fPLEBS -sid1 -topo-13.667,65.1,30 -house-13.667,65.1,W 
date (dmy) 28.6.1961 greg.   11:25:00 UT		version 1.80.00
UT: 2437478.97569444543     delta t: 33.788819 sec
ET: 2437478.97608551988   ayanamsa =   23°19' 8.9346
geo. long -13.667000, lat 65.100000, alt 0.000000
Epsilon (true)    23°26'39.4430
Nutation           0° 0' 0.0000    0° 0' 0.0000
Houses system W (equal/ whole sign) for long= -13°40' 1.1999, lat=  65° 5'59.9999
Sun               73°11'46.2283    -0° 0' 5.4498    0°56'50.0808
Moon             252°18'20.8864     3°21'13.0789   17° 7'46.8644
Mercury           71°40'23.6940    -4°24'49.5883   -0°35'36.6736
Venus             27°43'40.1024    -2°59'51.4929    0°59'54.0802
Mars             126°22'51.0558     1° 8'37.0169    0°35'14.3378
Jupiter          282° 6'45.3063    -0°32'24.8283   -0° 5'46.6493
Saturn           274°43' 5.8353    -0° 7'24.0457   -0° 3'55.5215
Uranus           119°51'37.1929     0°42'25.9104    0° 2'50.0504
Neptune          195°21'17.7253     1°48'21.5995   -0° 0'40.4664
Pluto            132°39'32.3108    12°40' 8.5567    0° 1'12.6489
mean Node        126°34'28.7665     0° 0' 0.0000   -0° 3'10.6335
true Node        125° 3'33.6207     0° 0' 0.0000   -0° 6'57.7871
mean Apogee      113° 4'50.0640    -1°12'13.3679    0° 6'38.9294
house  1         120° 0' 0.0000 
house  2         150° 0' 0.0000 
house  3         180° 0' 0.0000 
house  4         210° 0' 0.0000 
house  5         240° 0' 0.0000 
house  6         270° 0' 0.0000 
house  7         300° 0' 0.0000 
house  8         330° 0' 0.0000 
house  9           0° 0' 0.0000 
house 10          30° 0' 0.0000 
house 11          60° 0' 0.0000 
house 12          90° 0' 0.0000 
Ascendant        147°37'15.9425 
MC                51°51' 9.3895 
ARMC              73°54' 6.1133 
Vertex           314°59' 3.3503`;

var d = astro.fetchData(stdout);

console.log(d);