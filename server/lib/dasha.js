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

	offsets: [],

	addLords: (tmpDt, startIndex,num_years,depth) => {
		var lords=[],
		keyName = depth>1? 'pds' : 'ads',
		num = dasha.offsets.length,
		i=0,matched, offset,lord,y;
		for (;i<num;i++) {
			offset = (startIndex+i) % num;
			matched = dasha.offsets[offset];
			y = matched.years;
			if (typeof num_years == 'number' && num_years !== 120) {
				y *= (num_years / 120);
			}
			lord = {
				key: matched.key,
				start: tmpDt,
				end: tmpDt.clone().add(y,'years')
			}
			if (depth < 3) {
				lord[keyName] = dasha.addLords(tmpDt.clone(),offset,y,depth+1);
			}
			tmpDt = lord.end.clone();
			lords.push(lord);
		}
		return lords;
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
		lng = parseFloat(lng);
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
		dasha.offsets = dasha.calcOffsets(year_span);
		data.year_cycle = year_span;
		data.lng = lng;
		data.nak = dasha.calc_nak(lng);
		data.num = Math.floor(data.nak);
		data.frac = data.nak - data.num;
		data.num_bodies = dasha.offsets.length;
		data.num_naks = dasha.offsets.length * 3;
		if (data.num <= data.num_naks) {
			var lord = dasha.offsets[(data.num-1) % data.num_bodies],
			preceding = lord.years * data.frac,
			remaining = lord.years * (1-data.frac),
			tmpDt = date.clone().add(remaining,'years'),
			stDt = date.clone().subtract(preceding,'years');
			data.lord_key = lord.key;
			data.lord_remaining = remaining;
			var firstLord = {
				key: lord.key,
				start: stDt,
				end: tmpDt,
				ads: dasha.addLords(stDt.clone(),(data.num-1),lord.years,2)
			};
			data.dashas = dasha.addLords(tmpDt.clone(),data.num, 120, 1);
			data.dashas.unshift(firstLord);
		}
		data.offsets = dasha.offsets;
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