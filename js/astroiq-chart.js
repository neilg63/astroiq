var astroCoords = {
  lng: 0,
  lat: 0,
  ecl: 0
}

var bodyData = {
  lng: 0,
  lat: 0,
  ecl: 0,
  house: 0
}

var EphemerisData = {
  valid: false,
  astro: {
    ut: {
      value: 0,
      delta: "-",
      deltaType: "t",
      unit: "sec"
    },
    et: 0,
    nutation: [0,0],
    mean_node: astroCoords,
    true_node: astroCoords,
    mean_apogee: astroCoords,
    ascendant: 0,
    mc: 0,
    armc: 0,
    vertex: 0
  },
  ayanamsa: 0,
  bodies: {
    sun: bodyData,
    moon: bodyData,
    mercury: bodyData,
    venus: bodyData,
    mars: bodyData,
    jupiter: bodyData,
    saturn: bodyData,
    uranus: bodyData,
    neptune: bodyData,
    pluto: bodyData
  },
  datetime: "",
  dateinfo: {

  },
  gender: "unknown",
  geo: {

  },
  houses: [],
  houseData: {
    letter: "W",
    mode: "(equal/ whole sign)",
    lng: 0,
    lat: 0
  }
}

var app = new Vue({
  el: '#astroiq',
  data: {
    chartData: {
      active: false,
      name: '',
      dateStr: '',

    },
    results: EphemerisData
  },
  created: function() {
    AstroChart.init();
    if (window.location.search) {
      if (typeof window.location.search == 'string') {
        var id = window.location.search.split('id=').pop().split('&').shift();
        
        axios.get('/sweph-item/' + id).then(function(response){
          if (response.data) {
            app.parseResults(response.data);
            var data = response.data;
            if (data.houses) {
              app.updateChartData(data,0);
            }
          }
        });
        
      }
    }
  },
  methods: {
    parseResults: function(data) {
      var v1,v2,v3;
      if (data.astro.ascendant) {
        this.results.valid = true;
      } else {
        this.results.valid = false;
      }
      for (var k1 in data) {
        if (this.results.hasOwnProperty(k1)) {
          v1 = data[k1];
          if (typeof v1 == 'object') {
            for (var k2 in v1) {
              if (this.results[k1].hasOwnProperty(k2)) {
                v2 = v1[k2];
                if (typeof v2 == 'object') {
                  for (var k3 in v2) {
                    if (this.results[k1][k2].hasOwnProperty(k3)) {
                      v3 = v2[k3];
                      this.results[k1][k2][k3] = v3;
                    }
                  }
                } else {
                  this.results[k1][k2] = v2;
                }
              }
            }
          } else {
            this.results[k1] = v1;
          }
        }
      }
    },
    updateChartData: function(data,duration) {
      if (typeof data == 'object') {
        this.chartData.active = true;
        this.chartData.name = data.name;
        if (data.dateStr) {
          this.chartData.dateStr = data.dateStr;
        } else {
          this.chartData.dateStr = dateStringFormatted(data.datetime);
        }
        if (data.address) {
          this.chartData.address = data.address;
        } else if (data.geo.address) {
          this.chartData.address = data.geo.address;
        } else {
          this.chartData.address = "";
        }
      } else {
        this.chartData.active = false;
      }
      AstroChart.updateHouses(data.houses,duration);
    }
  }
});
