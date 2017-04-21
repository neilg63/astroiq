# AstroIQ Development

AstroIQ is a new Astrology Application, built on Swiss Ephemeris, but with full support for both Indian and Western astrology.

Demo Site: [astroiq.com](http://www.astroiq.com)

It uses a backend Rust application to convert the Swiss Ephemeris command line output to a JSON object with a full set of house systems, ayanamsas and aspects relating to a given date/time and geolocation. The source code for the Rust project has a separate (repository)[https://github.com/neilg63/astrojson]. 

The rest of the site is built in Node JS with Express and MongoDB. The frontend uses VueJS and D3 v4.  