const moment = require('moment');

var dasha = {

	// defined as fractions of 120
	grahas: {
		"Ke": 7,
		"Ve": 20,
		"Su": 6,
		"Mo": 10,
		"Ma": 7,
		"Ra": 18,
		"Ju": 16,
		"Sa": 19,
		"Me": 17
	},

	calc: (query, callback) => {
		var valid = false,
		dt='1970-01-01T00:00:00',
		data={valid:false},
		lng = 0,
		year_span = 120,
		date;

		if (query.lng) {
			lng = query.lng;
		}

		if (query.dt) {
			dt = query.dt;
		}
		if (/^\d\d\d\d-\d\d-\d\d/.test(dt)) {
			date = moment.utc(dt);
		}

		if (query.years) {
			year_span = query.years;
		}
		if (date) {
			data.date = date;
		}
		let offsets = dasha.calcOffsets(year_span);
		data.nak = dasha.calc_nak(lng);
		data.num = Math.floor(data.nak);
		data.frac = data.nak - data.num;
		data.num_bodies = offsets.length;
		data.num_naks = offsets.length * 3;
		if (data.num <= data.num_naks) {
			data.lord = offsets[(data.num-1) % data.num_bodies];
			data.lord_remaining = data.lord.years * (1-data.frac);
			data.next_lord = offsets[data.num % data.num_bodies];
			data.lord_end = date.clone().add(data.lord_remaining,'years');
			data.next_lord_end = data.lord_end.clone().add(data.next_lord.years,'years');
			for (var k in dasha.grahas) {
				
			}
		}

	    data.offsets = offsets;

	    valid = data.offsets.length>2;
		if (valid) {
			data.valid = true;
			callback(undefined,data);
		} else {
			callback(data,undefined);
		}
	},

	calcOffsets: (year_span) => {
	    var outer_offsets=[], index=0,j=0,offsets=[],val,k;

	    for (k in dasha.grahas) {
	    	val = dasha.grahas[k];
	    	offsets = [];
	    	for (j=0;j < 3;j++) {
	    		offsets.push((360.0/27.0) * index + (j * 120.0));
	    	}
	    	
	    	outer_offsets.push({
	    		key: k,
	    		lngs: offsets,
	    		years: (val * (year_span/120)) 
	    	});
	    	index++;
	    }
	    return outer_offsets;
	},

	calc_nak: (lng) => {
		return lng / (360.0/27.0) + 1.0;
	}


};

module.exports = dasha;