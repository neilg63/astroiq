/*d3 extensions*/

d3.selection.prototype.trigger = function(evtName, data) {  
  this.on(evtName)(data);
}

d3.selection.prototype.length = function() {  
  if (this._groups) {
    if (this._groups[0] instanceof Object) {
      return this._groups[0].length;
    }
  }
  return 0;
}

d3.selection.prototype.exists = function() { 
  if (this._groups) {
    if (this._groups.length>0) {
      return this._groups[0][0] !== null;
    }
  }
  return false;
}

d3.selection.prototype.eq = function(index) {  
  return d3.select(this[0][index]);
}

var config = {
  version: 0.2,
  storage: {
    maxRecs:50,
    maxKb: 2048
  }
};

var pDom = {};

var User = {
  geo: {}
};

var GeoMap = {

    map: null,

    marker: null,

    geoOn: false,

    matched: false,

    zoom: 9,

    setFocus: false,

    hasMap: false,

    buildMap: function(lat, lng,updateCoords) {
        var loc = {lat: lat, lng: lng}, hasMap = this.map === null;
        this.map = new google.maps.Map(document.getElementById('gmap'), {
          zoom: 6,
          center: loc,
          streetViewControl: true,
        });
        this.marker = new google.maps.Marker({
          position: loc,
          draggable: true,
          animation: google.maps.Animation.DROP,
          map: this.map
        });
        if (this.marker) {
          this.addDragendEvent(this.marker);
        }
        if (updateCoords === true) {
          this.updateCoords(coords);
        }
        if (GeoMap.setFocus==true) {
          GeoMap.focus();
          GeoMap.setFocus = false;
        }
        GeoMap.hasMap = true
    },

    updateAddress: function(data) {
      app.location.coords.lat = data.coords.lat;
      app.location.coords.lng = data.coords.lng;
      User.geo = data;
      app.location.address = data.name + ', ' + data.countryName;
      app.location.showAddress = true;
    },

    addDragendEvent: function(marker) {
        google.maps.event.addListener(marker, "dragend", function (e) {
            var lat = e.latLng.lat(),
            lng = e.latLng.lng();
            GeoMap.updateCoords(lat,lng);
            GeoMap.updateMap(lat,lng,false,false);
        });
    },

    zoomIn: function(target) {
        if (GeoMap.zoom < target) {
            if (GeoMap.map) {
                GeoMap.zoom = target;
                GeoMap.map.setZoom(GeoMap.zoom);
            }
        }
        /*var bounds = GeoMap.map.getBounds();
        var ne = bounds.getNorthEast(), sw = bounds.getSouthWest();
        var diffLat = (ne.lat() - sw.lat()),diffLng = (ne.lng() - sw.lng());
        var bLat1 = ne.lat()+ (diffLat * (1/4)),bLng1 = ne.lng()+ (diffLng * (1/4));
        var bLat2 = ne.lat()+ (diffLat * (3/4)),bLng2 = ne.lng()+ (diffLng * (3/4));
        var nb = new google.maps.LatLngBounds(
            new google.maps.LatLng(bLat2, bLng2),
            new google.maps.LatLng(bLat1, bLng1)
        );
        this.map.panToBounds(nb);*/
    },

    updateMap: function(lat,lng,updateMarker,animateZoom,mode) {
        var pos = {
           lat: lat,
           lng: lng 
        };
        
        if (animateZoom !== false && GeoMap.hasMap) {
            GeoMap.zoom = 14;
            this.map.setZoom(GeoMap.zoom)
            setTimeout(function() {
                GeoMap.zoomIn(15);
            }, 750);
            setTimeout(function() {
                GeoMap.zoomIn(16);
            }, 1250);
            setTimeout(function() {
                GeoMap.zoomIn(17);
            }, 1750);
            setTimeout(function() {
                GeoMap.zoomIn(18);
            }, 2250);
        }

        var ts = GeoMap.hasMap? 125 : 750;
        setTimeout(function() {
          if (GeoMap.hasMap) {
            GeoMap.map.setCenter(pos);
            GeoMap.setMode(mode);
            if (updateMarker) {
              GeoMap.marker.setPosition(pos);
              GeoMap.addDragendEvent(GeoMap.marker);
            }
          }
        }, ts);
        
    },

    showSatellite: function() {
      GeoMap.setMode('satellite');
    },

    setMode: function(mode) {
      var mm;
      if (GeoMap.hasMap) {
        switch (mode) {
          case 'terrain':
            mm = google.maps.MapTypeId.TERRAIN;
            break;
          case 'roadmap':
            mm = google.maps.MapTypeId.ROADMAP;
            break;
          default:
            mm = google.maps.MapTypeId.SATELLITE;
            break;
        }
        GeoMap.map.setMapTypeId(mm);
      }
    },

    matchLocation: function(position) {
        if (position.coords) {
            User.geo.coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var strCoords = User.geo.coords.lat + '/' + User.geo.coords.lng;
            axios.get('/geo/locate/'+ strCoords).then(function(response) {
              if (response.data) {
                var data = response.data;
                if (data.coords) {
                  GeoMap.updateAddress(data);
                  storeItem('geodata',data);
                }
              }
            });
            GeoMap.updateCoords(position.coords);
        }
    },

    errorHandler: function(error) {
        console.log(error);
    },

    updateCoords: function(coords,lng) {
        if (typeof coords != 'object') {
            coords = {
                lat: coords,
                lng: lng
            };
        }
        if (!coords.lat && coords.latitude) {
          coords.lat = coords.latitude;
        }
        if (!coords.lng && coords.longitude) {
          coords.lng = coords.longitude;
        }
        if (app) {
          app.toggleDegreeMode('display');
          app.location.coords.lat = coords.lat;
          app.location.coords.lng = coords.lng;
        } else {
          d3.select('#form-lat').property('value',coords.lat).trigger('change');
          d3.select('#form-lng').property('value',coords.lng).trigger('change');
        }

    },

    focus: function() {
      GeoMap.zoom = GeoMap.map.getZoom();
      GeoMap.showSatellite();
      if (GeoMap.zoom < 15) {
          if (GeoMap.zoom < 10) {
              GeoMap.zoom = 10;
          }
          setTimeout(function() {
              GeoMap.zoomIn(15);
          }, 500);
      }
      setTimeout(function(){
          GeoMap.zoomIn(16);
      }, 1000);
    },

    geoLocAllowed: function() {
        if (navigator.geolocation && GeoMap.matched === false) {
            if (window.location.protocol === 'https:' || /\bChrome\b/i.test(navigator.userAgent) == false) {
               var geoData = getItem('geodata',3600);
               if (!geoData.valid) {
                  navigator.geolocation.getCurrentPosition(GeoMap.matchLocation,GeoMap.errorHandler);
               } else {
                  GeoMap.updateAddress(geoData.data);
                  GeoMap.updateCoords(geoData.data.coords);
               }
               GeoMap.geoOn = true;
               GeoMap.matched = true;
               return true;
            }  
        }
        return false;
    },

    init: function() {
        setTimeout(function() {
            if (document.getElementById('form-lat')) {
                var lat = d3.select('#form-lat').property('value'),
                lng = d3.select('#form-lng').property('value');
                if (isNumeric(lat) && isNumeric(lng)) {
                    lat = parseFloat(lat);
                    lng = parseFloat(lng);
                    GeoMap.buildMap(lat,lng);
                }
            }
        },500);
    }
};

var AstroIQ = {
 
  bodies: ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto","ketu","rahu","pallas","ceres","juno"],

  fetchGeoFromIp: function() {
    var geoData = getItem('geodata',3600);

    if (geoData.valid == false) {
        axios.get('/geo/ip').then(function(response) {
          if (response.data) {
            var data = response.data;
            if (data.coords) {
              User.geo.coords = data.coords;
              storeItem('geodata',data);
              GeoMap.updateAddress(data);
              app.updateTzFields(data);
            }
          }
        });
    } else {
        if (geoData.data) {
            GeoMap.updateAddress(geoData.data);
            app.updateTzFields(geoData.data);

        }
    }
  },

  updateTzFields: function(geoData) {
    if (typeof geoData == 'object') {
      var p = pDom;
       if (geoData.timezone) {
            var tz = geoData.timezone;
            if (isNumeric(tz.gmtOffset)) {
                var strOffset = toHourOffsetString(tz.gmtOffset),strOffset2='';
                p.tzField.val(strOffset);
                if (tz.dstOffset != tz.gmtOffset) {
                    strOffset2 = toHourOffsetString((tz.dstOffset-tz.gmtOffset),1);
                    p.dsField.val(strOffset2);
                }
                if (strOffset2.length>0) {
                    strOffset += ' (' + strOffset2 + ')';
                }
                p.timezoneFsDisplay.html(' UTC ' + strOffset + ' hrs');
            }
       } 
    }
  },

  buildBodyList: function() {
    var bodies=[],
    bns = AstroIQ.bodies,
      i=0,
      nb = bns.length;
      for (;i<nb;i++) {
        bodies.push({key:bns[i],lng: 0,lat: 0,spd: 0,glat:0,glng: 0,gspd:0,pos:0});
      }      
      return bodies;
  },

  matchBody: function(key) {
    var b = _.find(AstroIQ.bodies,function(b) { return b.startsWith(key,'i'); });
    if (typeof b == 'string') {
      return b.capitalize();
    }
  },

  translateDashas: function(dashas,dateFormat,prevDate,level) {
    if (dashas instanceof Array) {
      if (!level) {
        level = 1;
      }
      var d,k;
      for (k in dashas) {
        d = dashas[k];
        if (typeof d == 'object') {
          if (d.key) {
            d.name = AstroIQ.matchBody(d.key);
            d.iconClass = 'icon-'+d.name.toLowerCase()+'-devanagari';
            d.dt = '';
            if (!d.start) {
              d.start = prevDate;
            }
            if (d.start) {
              d.dt = moment.utc(d.start).format(dateFormat) + ' - ';
            }
            if (d.end) {
              d.dt += moment.utc(d.end).format(dateFormat);
            }
            prevDate = d.end;
            if (level == 1 && d.ads) {
              d.ads = AstroIQ.translateDashas(d.ads,dateFormat,d.start,2);
            }
            if (level == 2 && d.pds) {
              d.pds = AstroIQ.translateDashas(d.pds,dateFormat,d.start,3);
            }
          }
        }
      }
    }
    return dashas;
  },

  buildHouses: function() {
    var houses=[],tot = 36,i=0;
    for (;i<tot;i++) {
      houses.push({num:0,lng:-1,end:-1});
    }
    return houses;
  },

  parseResults: function(data,options) {
    var parsed={}, hsy="W", ayanamsa=1, i=0,matched,k;
    parsed.ayanamsa = 0;
    if (data.ayanamsas) {
      if (options.ayanamsa) {
        if (isNumeric(options.ayanamsa)) {
          ayanamsa = parseInt(options.ayanamsa);
        } else {
          ayanamsa = -1;
        }
      }
      matched = _.find(data.ayanamsas,function(a){return a.num == ayanamsa});
      if (matched) {
        parsed.ayanamsa = matched.value;
      }
    }
    for (k in data) {
      switch (k) {
        case 'bodies':
          var bodies = [],b;
          if (data[k] instanceof Array) {
            for (i=0;i<data[k].length;i++) {
              b = data[k][i];
              b.lng = ((b.lng - parsed.ayanamsa)+360) % 360;
              if (b.glng) {
                 b.glng = ((b.glng - parsed.ayanamsa)+360) % 360;
              }
              bodies.push(b);
            }
          }
          parsed.bodies = bodies;
          break;
        case 'houses':
          if (options.hsy) {
            hsy = options.hsy;
          }
          matched = _.find(data.houses,function(h){return h.key == hsy});
          if (!matched) {
            matched = _.find(data.houses,function(h){return h.key == "E"});
          }
          if (matched) {
            parsed.houses = [];
            parsed.houseLngs = [];
            var nv = matched.values.length,nvTot=nv,h,lng,end;

            switch (nv) {
              case 6:
              case 18:
                nvTot = (nv*2);
                break;
            }
            if (nv > 1) {
              for (i=0; i < nvTot; i++) {
                if (i < nv) {
                  lng = parseFloat(matched.values[i]);
                } else {
                  lng = (parseFloat(matched.values[(i-nv)]) + 180) % 360;
                }
                lng = ((lng - parsed.ayanamsa) + 360) % 360; 
                if (nv - (i % nv) === 1) {
                  end = parseFloat(matched.values[0]);
                } else {
                   end = parseFloat(matched.values[((i+1)%nv)]);
                }
                if ((i+1) >= nv && (i+1) < (nv*2)) {
                  end = (end+180) % 360;
                }
                h = {
                  num: (i+1),
                  lng: lng,
                  end: end,
                };

                parsed.houseLngs.push(lng);
                parsed.houses.push(h);
              }
            }
          }
          break;
        case 'ascendant':
          parsed[k] = ((parseFloat(data[k]) - parsed.ayanamsa)+360) % 360;
          break;
        default:
          parsed[k] = data[k];
          break;
      }
    }

    parsed.person = data.person;
    return parsed;
  },

  addRecord: function(items,item,k,ts,dateFormat) {
    if (item.person) {
      var li = {
        ts: ts,
        chartId: k,
        name: item.person.name,
        dateStr: moment.utc(item.datetime).format(dateFormat),
        datetime: item.datetime,
        address: item.address
      };
      items.push(li);
    }
  },

  loadGMap: function(focus,lat,lng) {
    var gMapApi = d3.select('#gmap-api-key');
    
    if (gMapApi.exists()) {
      var gMapApiKey = gMapApi.property('value'),
        st = d3.select('#gmap-core');
      if (!st.exists() && gMapApiKey) {
          d3.select('body')
          .append('script')
          .attr('id',"gmap-core")
          .attr('async',true)
          .attr('defer',true)
          .attr('src','https://maps.googleapis.com/maps/api/js?key='+gMapApiKey+'&callback=initMap');
          if (focus === true) {
            GeoMap.setFocus = true;
          }
          if (lat) {
            if (lng) {
              GeoMap.buildMap(lat,lng);
            }
          }
      }
    }
  },
  addListCollapse: function() {
    d3.selectAll('ul li.toggle').on('click',function(){
      d3.event.stopImmediatePropagation();
      var list = d3.select(this).select('ul');
      if (list.classed('closed')) {
          list.classed('closed',false).classed('open',true);
          d3.select(this).classed('expanded',true);
      } else {
          list.classed('open',false).classed('closed',true);
          d3.select(this).classed('expanded',false);
      }
    });
  },
  init: function() {
    AstroChart.init();
    var p = pDom;
    if (window.viewportSize) {
       p.width = window.viewportSize.getWidth();
       p.height = window.viewportSize.getHeight();
    } else {
       p.width = document.body.clientWidth;
       p.height = document.body.clientHeight;
    }
    p.mobileMax = 959;
    p.medDesktopMin = 1280;
    setTimeout(function(){
      if (app) {
      if (app.currId) {
          if (typeof app.currId == 'string') {
            if (app.currId.length>8) {
              app.loadQuery(app.currId);
            }
          }
        }
      }
    }, 1000);
    d3.selectAll('#control-panel .collapsible > .toggle').on('click',function(){
      var e = d3.event, par = d3.select(this.parentNode);
      e.stopImmediatePropagation();
      if (par.classed('closed')) {
          d3.select(this.parentNode.parentNode).select('fieldset.collapsible.open').classed('open',false).classed('closed',true);
          par.classed('closed',false).classed('open',true);
      } else {
          par.classed('open',false).classed('closed',true);
      }
  });
  }
}

function initMap() {
    return GeoMap.init();
}

var EphemerisData = {
  valid: false,
  person: {
    id: null,
    name: "",
    gender: "unknown"
  },
  rodden: "-",
  ascendant: 0,
  ut: 0,
  delta_t: 0,
  et: 0,
  nutation: {lng: 0,lat:0},
  mean_node: {lng: 0,lat: 0,spd: 0},
  true_node: {lng: 0,lat: 0,spd: 0},
  mean_apogee: {lng: 0,lat: 0,spd: 0},
  mc: 0,
  armc: 0,
  vertex: 0,
  ayanamsas: [],
  bodies: AstroIQ.buildBodyList(),
  name: "",
  datetime: "",
  dateinfo: {
    gmtOffset: null,
    tz: null,
    display: "",
    display_utc: "",
    info: ""
  },
  gender: "unknown",
  geo: {
    lat: 0,
    lng: 0,
    alt: 0,
    display_coords: "",
    address: ""
  },
  houses: AstroIQ.buildHouses(),
  houseLngs: [],
  chart_type: "birth",
  aspects: {},
  hasAspects: false
};

var app = new Vue({
  components: {
    autocomplete: Vue2Autocomplete
  },
  el: '#astroiq',
  data: {
    initialised: false,
    user: {
      loggedin: false,
      showForm: false,
      registerMode: "login",
      submitLabel: "Log in!",
      username: "",
      screenname: "",
      password: "",
      cpassword: "",
      id: "",
      type: "",
      isAdmin: false,
      statusMsg: "Not logged in",
      errorMsg: "",
      storage: 0,
      storage_kb: 0
    },
    recordId: null,
    recordEditable: false,
    personEditable: false,
    newRecord: false,
    newPerson: false,
    personId: null,
    chartActive: false,
    chartType: "birth",
    eventType: "",
    eventTitle: "",
    candidateName: "",
    rodden: "-",
    currName: "",
    people: {
      persons:[],
      num:0,
      showSelected:false
    },
    gender: {
      active: true,
      type: "unknown",
      otherActive: false,
      otherType: ""
    },
    dob: '2017-01-01',
    tob: '13:00',
    labels: {
      date: "Date and time of birth",
      promptType: "Event type"
    },
    timezone: {
      offset: '00:00',
      ds: '0:00',
      display: ''
    },
    location: {
      search: "",
      showAddress: false,
      address: "",
      coords: {
        lat: 0,
        lng: 0,
        alt: 30,
        latComponents: {
          deg: 0,
          min: 0,
          sec: 0,
          dir: 'N'
        },
        lngComponents: {
          deg: 0,
          min: 0,
          sec: 0,
          dir: 'E'
        },
        latDms: "",
        lngDms: ""
      },
      altDisplay: "30",
      altUnit: "m",
      altSteps: 10,
      altMax: 9000
    },
    options: {
      ayanamsa: "-",
      ayanamsaName: "",
      hsy: "W",
      houseName: "Equal",
      mode: 'topo',
      layout: "western",
      dateFormat: 'DD/MM/YYYY'
    },
    geonames: {
      active: false,
      items: [],
      num: 0
    },
    hospitals: {
      active: false,
      items: [],
      num: 0
    },
    queries: [],
    coordinatesClass: 'display',
    activeTab: 'chart',
    subPane: 'form',
    chartSizeClass: 'magnify-1',
    chartMode: 'western',
    showTopMenu: false,
    toggleMenuMessage: "Show main menu",
    results: EphemerisData,
    dashaData: {
      active: false,
      dashas: []
    },
    currId: ""
  },
  created: function() {
    
    var c = this.location.coords;
    this.initDate();
    c.latDms = toLatitudeString(this.location.coords.lat,'plain');
    c.lngDms = toLongitudeString(this.location.coords.lng,'plain');
    this.updateDms(c,false);
    this.updateDms(c,true);

    var ud = getItem('user');
    if (ud.data) {
      if (ud.data.id) {
        this.user = ud.data;
        this.user.showForm = false;
      }
    } else {
      if (vars.public.userId) {
        this.user.id = vars.public.userId;
      }
    }
    if (localStorageSupported() && this.user.loggedin) {
      this.loadUserData();
    }
  },
  mounted: function() {
    var idData = getItem('curr_id');
    if (idData.valid) {
      this.currId = idData.data;
      d3.select('body').classed('mounted',true);
    }
  },
  watch: {
    chartType: function() {
      switch (this.chartType) {
        case 'birth':
          this.gender.active = true;
          this.labels.date = 'Date and time of birth';
          break;
        default:
          this.labels.date = 'Date and time';
          this.gender.active = false;
          break;
      }
      switch (this.chartType) {
        case 'question':
          this.labels.promptType = 'Prompt';
          break;
        case 'electional':
          this.labels.promptType = 'Prompt';
          break;
        default:
          this.labels.promptType = 'Event type';
          break;
      }
    },
    'gender.type': function() {
      switch (this.gender.type) {
        case 'other':
          this.gender.otherActive = true;
          break;
        default:
          this.gender.otherActive = false;
          break;
      }
    },
    'options.ayanamsa': function() {
      if (vars) {
        if (vars.ayanamsas) {
          var opt = this.options.ayanamsa.toString();
          if (vars.ayanamsas[opt]) {
            this.options.ayanamsaName = vars.ayanamsas[opt];
          }
        }
      }
    },
    'options.hsy': function() {
      if (vars) {
        if (vars.houseSystems) {
          var opt = this.options.hsy.toString();
          if (vars.houseSystems[opt]) {
            this.options.houseName = vars.houseSystems[opt];
          }
        }
      }
    },
    'location.altUnit': function() {
      return this.updateAltitude(true);
    },
    'location.altDisplay': function() {
      return this.updateAltitude();
    },
    'location.coords.lat': function() {
      if (this.coordinatesClass != 'show-dms-degrees') {
        this.location.coords.latDms = toLatitudeString(this.location.coords.lat,'plain');
        this.updateDms(this.location.coords,false);
      }
    },
    'location.coords.lng': function() {
      if (this.coordinatesClass != 'show-dms-degrees') {
        this.location.coords.lngDms = toLongitudeString(this.location.coords.lng,'plain');
        this.updateDms(this.location.coords,false);
      }
    },
    'location.coords.latComponents.deg': _.debounce(function() {
      this.updateCoordsFromDms(false,'deg');
    },500),
    'location.coords.latComponents.min': _.debounce(function() {
      this.updateCoordsFromDms(false,'min');
    },500),
    'location.coords.latComponents.sec': _.debounce(function() {
      this.updateCoordsFromDms(false,'sec');
    },500),
    'location.coords.latComponents.dir': _.debounce(function() {
      this.updateCoordsFromDms(false,'dir');
    },250),
    'location.coords.lngComponents.deg': _.debounce(function() {
      this.updateCoordsFromDms(true,'deg');
    },500),
    'location.coords.lngComponents.min': _.debounce(function() {
      this.updateCoordsFromDms(true,'min');
    },500),
    'location.coords.lngComponents.sec': _.debounce(function() {
      this.updateCoordsFromDms(true,'sec');
    },500),
    'location.coords.lngComponents.dir': _.debounce(function() {
      this.updateCoordsFromDms(true,'dir');
    },250)
  },
  methods: {
    loadUserData: function() {
      this.loadQueries();
      
      
      if (this.user.loggedin) {
        var stored = getItem('persons');
        if (stored.data) {
            this.people.persons = stored.data;
            this.people.num = this.people.persons.length;
        } else {
          axios.get('/person-names-all/' + this.user.id).then(function(response){
          if (response.data instanceof Array) {
              app.people.persons = response.data;
              app.people.num = app.people.persons.length;
              storeItem('persons',app.people.persons);
            }
          });
        }
        var stored = getItem('options',1,'y');
        if (stored.data) {
          this.options = stored.data;
        }
      }
    },
    matchPerson: function() {
      var txt = this.candidateName.trim(),numSelected=0;
      if (txt.length > 0) {
        this.personEditable = true;
        var p=this.people.persons,i=0,
        sl = txt.length>2? '' : '^',
        rgx = new RegExp(sl + txt,'i');
        for (;i<this.people.num;i++) {
          if (rgx.test(p[i].name)) {
            p[i].hidden = false;
            numSelected++;
            if (numSelected === 1) {
              app.people.showSelected = true;
            }
          } else {
            p[i].hidden = true;
          }
        }
        if (txt.length>1 && this.currName.startsWith(this.candidateName,'i') == false) {
          this.newPerson = true;
          this.newRecord = true;
        }
      }
      if (numSelected <1) {
        app.people.showSelected = false;
      }

    },
    resetPersons: function() {
      _.each(this.people.persons,function(p) { p.hidden = true; });
      this.people.showSelected = false;
    },
    selectPerson: function(person) {
      if (person) {
        this.updateRefName(person.name);
        this.personId = person.id;
        this.personEditable = true;
        this.resetPersons();
      }
    },
    updateRefName: function(name) {
      this.candidateName = name;
      this.currName = name;
    },
    addQueryItems: function(items) {
      items = items.sort(function(a,b){
        return b.ts - a.ts
      });
      for (var i=0;i<items.length;i++) {
        this.queries.push(items[i]);
      }
    },
    loadQueries: function() {
      var items = [], 
      fmt = this.matchDateFormat(),
      index=0, size=0,sz=0,item;
      maxSize = config.storage.maxKb * 1024;
      for (k in window.localStorage) {
        item = getItem(k);
        if (item.expired && size < maxSize) {
          deleteItem(k);
        }
        if (k.startsWith('ch_')) {
          if (item.valid && index < config.storage.maxRecs) {
            AstroIQ.addRecord(items,item.data,k,item.ts,fmt);
            index++;
          }
        }
        if (typeof window.localStorage[k] == 'string') {
          sz = window.localStorage[k].length;
          size += sz;
          size += k.length;
        }
      }
      this.addQueryItems(items);
      this.user.storage = size;
      this.user.storage_kb = parseInt(size / 1024);
    },
    assignBodyPositions: function(data) {
      if (data.bodies) {
          var numLngs = data.houseLngs.length,  lastLng = data.houseLngs[0];
          data.bodies = _.map(data.bodies,function(b) {
              var i=0,len=0,start,end,matched,frac;
              for (;i<numLngs;i++) {
                start = data.houseLngs[i];
                matched = false;
                if (i < (numLngs-1)) {
                  end = data.houseLngs[(i+1)];
                } else {
                  end = lastLng;
                }
                if (start < end) {
                  matched = (b.lng >= start && b.lng < end);
                  len = end - start;
                } else {
                  matched = (b.lng <= end || b.lng > start);
                  len = (end+360) - start;
                }
                if (matched) {
                  if (b.lng > start) {
                    frac = (b.lng-start)/len;
                  } else {
                    frac = ((b.lng+360)-start)/len;
                  }
                  b.pos = Math.approxFixed((i+1) + frac,3);
                }
              }
              return b;
          });
        }
    },
    assignResults: function(data) {
      this.assignBodyPositions(data);
      var v1,v2,v3,k1,k2,k3;
      if (data.ascendant) {
        this.results.valid = true;
      } else {
        this.results.valid = false;
      }
      for (k1 in data) {
        if (this.results.hasOwnProperty(k1)) {
          v1 = data[k1];
          if (typeof v1 == 'object') {
            for (k2 in v1) {
              if (this.results[k1].hasOwnProperty(k2)) {
                v2 = v1[k2];
                if (typeof v2 == 'object') {
                  for (k3 in v2) {
                    if (this.results[k1][k2].hasOwnProperty(k3)) {
                      v3 = v2[k3];
                      this.results[k1][k2][k3] = parseAstroResult(v3,k3,k2);
                    }
                  }
                } else {
                  this.results[k1][k2] = parseAstroResult(v2,k2,k1);
                }
              }
            }
          } else {
            this.results[k1] = parseAstroResult(v1,k1);
          }
        }
      }

      if (this.results.geo.lat) {
        var geo = this.results.geo;
        this.location.coords.lat = geo.lat;
        this.location.coords.lng = geo.lng;
        this.location.coords.alt = geo.alt;
        this.location.address = geo.address;
        d3.select('#location-address').property('value',geo.address);
        d3.select('#form-location').property('value','');
        this.location.search = '';
        this.results.geo.display_coords = toLatitudeString(geo.lat,'plain') + ', ' + toLongitudeString(geo.lng,'plain')
      }
      if (this.results.datetime) {
        if (/^\d\d\d\d-\d\d-\d\d?/.test(this.results.datetime)) {
          if (data.dateinfo) {
            var fmt = app.matchDateFormat(), dt = this.results.datetime;
            this.results.dateinfo.tz = data.dateinfo.zone;
            if (data.dateinfo.hasOwnProperty('gmtOffset')) {
                this.results.dateinfo.display_utc =  "UTC: " + moment.utc(dt).format(fmt);
                this.results.dateinfo.gmtOffset = data.dateinfo.gmtOffset;
                
                var localDt = moment.utc(dt).add(data.dateinfo.gmtOffset, 'seconds');
                this.results.dateinfo.datetime = localDt.toDate();
                this.results.dateinfo.info =   data.dateinfo.zone;
                if (this.results.dateinfo.gmtOffset === 0) {
                  this.results.dateinfo.info =   data.dateinfo.zone += ' UTC ' + secondsToHours(this.results.dateinfo.gmtOffset);
                }
                this.results.dateinfo.display =  localDt.format(fmt);
            }
            var dtMap = isoDateTimeToMap(localDt.toISOString());
            if (dtMap.valid) {
              this.dob = dtMap.date;
              this.tob = dtMap.time;
            }
          }
        }
      }
      if (data.houses) {
        this.results.houses = data.houses;
      }
      if (this.results.houses) {
        var hb,i=0;
        for (var i in this.results.houses) {
          hb = this.results.houses[i];
          if (hb.lng) {
            hb.lng = parseAstroResult(hb.lng,'lng');
            hb.lat = parseAstroResult(hb.lng,'lat');
            hb.end = parseAstroResult(hb.lng,'end');
          }
        }
      }
      if (this.results.mc) {
        this.results.mc = parseAstroResult(this.results.mc,'lng');
      }
      if (this.results.ut) {
        this.results.ut_info = "Universal time: " + this.results.ut;
      }
      if (data._id) {
        this.currId = data._id;
        this.recordEditable = data._id.length>10;
      }
      if (data.personId) {
        this.personId = data.personId;
        this.personEditable = data.personId.length>10;
      }
      if (this.results.person) {
        this.updateRefName(this.results.person.name);
      }

      if (data.person.gender) {
        this.gender.type = data.person.gender;
      }
      if (data.person.name) {
        this.candidateName = data.person.name;
      }
      if (data.aspects) {
        this.results.hasAspects = false;
        for (k in data.aspects) {
          if (data.aspects[k] instanceof Array) {
            if (data.aspects[k].length>0) {
              this.results.hasAspects = true;
              break;
            }
          } 
        }
        var toAspect = function(aspect) {

          aspect.startDms = parseAstroResult(aspect.start,'lng');
          aspect.endDms = parseAstroResult(aspect.end,'lng');
          return aspect;
        }
        var toAspectSets = function(aspectSet,key) {
          var items = _.map(aspectSet,toAspect);
          return {
            key: key,
            items: items,
            numItems: items.length
          };
        }
        if (this.results.hasAspects) {
          this.results.aspects = _.map(data.aspects,toAspectSets);
        } else {
          this.results.aspects = {};
        }
      }
      this.newPerson = false;
      this.newRecord = false;
    },
    searchLocation: function() {
      this.location.showAddress = false;
      
      if (this.location.search.length>0) {
          var adStr = this.location.search.trim(),
            href = '/geo/code/' + adStr,
            key = 'geocode' + adStr.replace(/\s+/g,'_');
          var stored = getItem(key);
          if (stored.valid) {
            this.updateGeoDetails(stored.data);
          }
          axios.get(href)
            .then(function(response) {
            var msg = '';
            if (response.data && app) {
              var data = response.data;
              if (data.valid) {
                app.updateGeoDetails(data,key);
                app.location.address = data.address;
                d3.select('#location-address').property('value',data.address);
              } else if (data.message) {
                  msg = data.message;
              }
              if (data.has_geonames) {
                  app.updateGeoDetails(data);
                  if (data.geomatched_index === 0) {
                     var matchedGeo = data.geonames.items[data.geomatched_index]; 
                     app.updateTzFields(matchedGeo);
                  }
              };
              if (msg.length > 1) {
                  app.location.address = msg;
                  app.location.showAddress = true;
                  if (data.message && !data.valid) {
                      setTimeout(function() {
                          app.location.showAddress = false;
                      },5000);
                  }
              }
            }
        });
      }
    },
    updateAltitude: function(change) {
      var data = convertFtAndMetres(this.location.altDisplay,this.location.altUnit,change);
      this.location.coords.alt = data.m;
      this.location.altDisplay = data.display;
      this.location.altSteps = data.steps;
      this.location.altMax = data.max;
    },
    updateDms: function(coords,isLng) {
      var ref, l;
      if (isLng) {
        ref = coords.lng;
        l = coords.lngComponents;
      } else {
        ref = coords.lat;
        l = coords.latComponents;
      }
      var dms = convertDDToDMS(ref,isLng);    
      l.dir = dms.dir;
      l.deg = dms.deg;
      l.min = dms.min;
      l.sec = dms.sec;
    },
    updateCoordsFromDms: function(isLng,component) {
      var c = this.location.coords, ref, l;
      if (isLng) {
        l = c.lngComponents;
      } else {
        l = c.latComponents;
      }
      if (l[component].length > 0) {
        var ref = convertDmsToDec(l.deg,l.min,l.sec,l.dir);
        if (isLng) {
          c.lng = ref;
          c.lngDms = toLongitudeString(ref,'plain');
        } else {
          c.lat = ref;
          c.latDms = toLatitudeString(ref,'plain');
        }
      }
    },
    initDate: function() {
      if (this.initialised !== true) {
        var cDate = new Date().toISOString().split('T').shift(),
        year = cDate.split('-').shift() - 0;
        year -= 20;
        var dStr = cDate.replace(/^\d\d+-/,year + '-');
        this.dob = dStr;
        this.initialised = true;
      }
    },
    updateGeoDetails: function(data,key) {
      if (isNumeric(data.lat)) {
        var lat = data.lat,lng = data.lng;
        this.location.coords.lat = lat;
        this.location.coords.lng = lng;
      }
      this.hospitals.active = false;
      this.geonames.active = false;
      this.hospitals.items = [];
      this.geonames.items = [];
      var lat=data.lat,lng=data.lng;
      if (data.hospitals) {
        if (data.hospitals.num_items > 0) {
          var i=0,h,li;
          for (; i < data.hospitals.num_items;i++) {
            h = data.hospitals.items[i];
            if (h.name) {
              li = {
                coords: h.coords.lat+','+h.coords.lng,
                name: h.name +': '+h.vicinity
              };
              this.hospitals.items.push(li);
            }
          }
          this.hospitals.num = data.hospitals.num_items;
          this.hospitals.active = true;
        }
      }
      if (data.geonames) {
        if (data.geonames.num_items > 0) {
          var i=0,row,li,nameParts=[];
          for (; i < data.geonames.num_items;i++) {
            row = data.geonames.items[i];
            if (row.name) {
              li = {
                coords: row.coords.lat+','+row.coords.lng,
                name: row.longName
              };
              this.geonames.items.push(li);
            }
          }
          this.geonames.num = data.geonames.num_items;
          this.geonames.active = data.geonames.num_items > 1;
        }
      }
      if (GeoMap) {
         if (GeoMap.map !== null) {
              GeoMap.updateMap(lat, lng, true);
          } else {
              AstroIQ.loadGMap(true,lat,lng);             
          }
          this.showPane('map');
      }
      if (key) {
        if (typeof key == 'string') {
          storeItem(key,data);
        }
      }
      
    },
    updateTzFields: function(geoData) {
      if (typeof geoData == 'object') {
       if (geoData.timezone) {
          var tz = geoData.timezone;
          if (isNumeric(tz.gmtOffset)) {
            var strOffset = toHourOffsetString(tz.gmtOffset),strOffset2='';
            this.timezone.offset = strOffset;
            if (tz.dstOffset != tz.gmtOffset) {
              strOffset2 = toHourOffsetString((tz.dstOffset-tz.gmtOffset),1);
              this.timezone.ds = strOffset2;
            }
            if (strOffset2.length>0) {
              strOffset += ' (' + strOffset2 + ')';
            }
            this.timezone.display = ' UTC ' + strOffset + ' hrs';
          }
        }
      }
    },
    updateMap: function(coords,name) {
      if (coords) {
        this.toggleDegreeMode('display');
        var parts = coords.split(',');
        if (isNumeric(parts[0]) && isNumeric(parts[1])) {
          parts[0] = parseFloat(parts[0]);
          parts[1] = parseFloat(parts[1]);
          GeoMap.updateMap(parts[0],parts[1],true,false);
          this.location.coords.lat = parts[0];
          this.location.coords.lng = parts[1];
          if (typeof name == 'string') {
            if (name.length>2) {
              this.location.address = name;
              d3.select('#location-address').property('value',name);
            }
          }
        }
      }
    },
    findOnMap: function() {
      var strCoords = this.location.coords.lat +'/'+this.location.coords.lng;
      axios.get('/geo/locate/'+ strCoords).then(function(response) {
        if (response.data) {
          var data = response.data;
          if (data.coords) {
            if (app.activeTab != 'map') {
              app.showPane('map');
            }
            GeoMap.updateAddress(data);
            var c = app.location.coords, mode = 'satellite';
            if (data.radius > 20) {
              mode = 'terrain';
            }
            GeoMap.updateMap(c.lat,c.lng,true,true,mode);
          }
        }
      }); 
    },
    loadMap: function() {
      this.toggleDegreeMode('display');
      AstroIQ.loadGMap();
    },
    refreshLocalItem: function(paramStr) {
      this.loadQuery(paramStr,true);
    },
    saveSettings: function() {
      storeItem('options',this.options);
    },
    sendControlForm: function() {
      if (this.dob.length>0 && this.candidateName.length>0) {
          var dobV = this.dob,
          tobV = this.tob,
          lngV = this.location.coords.lng,
          latV = this.location.coords.lat,
          altV = this.location.coords.alt;
          lngV = roundDecimal(lngV,5);
          latV = roundDecimal(latV,5);

          var params={}, timeParts = tobV.split(':');
          if (timeParts.length>1) {
            if (typeof this.currId == 'string' && this.newRecord !== true) {
              params.id = this.currId;
            }
            if (typeof this.personId == 'string') {
              params.personId = this.personId;
            }
            var secs = '00',secStr='';
            if (timeParts.length>2) {
              secStr = timeParts[2];
              if (isNumeric(secStr)) {
                secStr = parseInt(secStr);
                if (secStr < 60) {
                  secs = zeroPad2(secStr);
                }
              }
            }
            timeParts[2] = secs;
            tobV = timeParts.join(':');
          }
          params.lc = latV + ',' + lngV + ',' + altV;

          params.dt = dobV+'T'+tobV;
          
          params.name = this.candidateName.trim();
          params.chartType = this.chartType;
          var genderVal = this.gender.type;
          if (this.gender.type == 'other') {
            genderVal = this.gender.otherType;
          }
          params.address = this.location.address;
          params.gender = genderVal;
          params.rodden = this.rodden;
          var update = false;
          if (this.newRecord !==true && this.recordEditable === true) {
            update = params.id.length>5;
          }
          params.newRecord = this.newRecord;
          params.newPerson = this.newPerson;
          this.loadQuery(params,update); 
      }
    },
    updateChartResults: function(inData) {
      console.log(inData.ayanamsas)
      var data = AstroIQ.parseResults(inData,this.options);
      this.results.ayanamsa = data.ayanamsa;
      this.assignResults(data);
      this.updateChartData(data);
      this.currId = inData._id;
      this.dashaData = {
        active: false,
        dashas: []
      };
      if (this.activeTab == 'dashas') {
        this.loadDashas();
      }
      return data;
    },
    updateChartData: function(data) {
      this.toggleDegreeMode('display');
      if (typeof data == 'object') {
          if (this.activeTab == 'map') {
          var c = this.location.coords;
            GeoMap.updateMap(c.lat,c.lng,true,false);
        }
        AstroChart.refresh(data,this.options.mode);
        this.chartActive = true;
      } else {
        this.chartActive = false;
      }
      
    },
    updateChartOptions: function() {
      if (this.currId) {
        var chartKey = 'ch_' + this.currId,
        stored = getItem(chartKey);
        if (stored.valid) {
          this.updateChartResults(stored.data);
        }
      }
    },
    loadQuery: function(params, update) {
      d3.select('#form-location').property('value','');
      var objId = '', hasId = false, chartKey = '',hasData=false;
      if (typeof params == 'string') {
        objId = params.split('_').pop();
        storeItem('curr_id',objId);
        chartKey = 'ch_' + objId;
        hasId = objId.length > 5;
        params = {};
      }
      if (!params) {
        params={};
      }
      this.location.search = '';
      if (update !== true && hasId) {
        var stored = getItem(chartKey);
        if (stored.valid) {
          this.updateChartResults(stored.data);
          hasData = true;
        }
      }

      if (!hasData && params.lc) {
        params.userId = this.user.id;
        axios.post('/api/astro',params).then(function (response) {
          if (response.data) {
            app.activeTab = 'chart';
            objId = response.data._id;
            chartKey = 'ch_' + objId;
            storeItem(chartKey,response.data);
            var data = app.updateChartResults(response.data);
            var item = {
              id: objId,
              chartId: chartKey,
              name:data.person.name,
              dateStr: moment.utc(data.datetime).format(app.matchDateFormat()),
              datetime: data.datetime,
              address: data.geo.address
            };
            if (!update) {
              app.queries.unshift(item);
            } else {
              app.replaceQuery(chartKey,item);
            }
            app.currId = objId;
            
            app.personId = data.personId;
            var stored = getItem('persons');
            if (stored.valid) {
              var persons = stored.data,
                matches = _.filter(persons,function(p){return p.id == app.personId;});
                if (matches.length < 1) {
                  var p = {
                    id: app.personId,
                    name: data.person.name,
                    hidden:true
                  }
                  persons.push(p);
                  app.people.persons = _.sortedUniqBy(persons,'name');
                  app.people.num_persons = app.people.persons.length;
                  storeItem('persons',persons);
                }
            }
          }
        })
        .catch(function (error) {
          console.log({error:error});
        });
      }
      app.showSub('form'); 
    },
    matchQuery: function(chartId) {
      return _.findIndex(this.queries,['chartId',chartId]);
    },
    deleteQuery: function(chartId,subPane) {
      var matched = this.matchQuery(chartId);
      if (matched >= 0) {
        this.queries.splice(matched,1);
      }
      deleteItem(chartId);
      if (subPane) {
        this.showSub('queries');
      }
      var data = {
        id: chartId.split('_').pop(),
        userId: this.user.id
      };
      axios.post('api/chart/delete', data).catch(function(error){
        console.log(error) 
      });
    },
    replaceQuery: function(chartKey,updatedItem) {
      var matched = this.matchQuery(chartKey);
      if (matched >= 0) {
        this.queries[matched] = updatedItem;
      }
    },
    showPane: function(pType) {
      this.toggleDegreeMode('display');
      switch (pType) {
        case 'map':
          this.loadMap();
          var c = this.location.coords;
          GeoMap.updateMap(c.lat,c.lng,true,false);
          break;
        case 'dashas':
          if (this.dashaData.active !== true) {
            this.loadDashas();
          }
          break;
      }
      this.activeTab = pType;
    },
    injectDashas: function(data,dKey) {
      var fmt = app.matchDateFormat();
      data.dashas = AstroIQ.translateDashas(data.dashas,fmt);
      var utcDate = moment.utc(data.datetime);
      data.datetime_utc = utcDate.format(fmt);
      data.datetime_lc = utcDate.add(data.dateinfo.gmtOffset,'seconds').format(fmt);
      if (data.geo) {
        data.coords_str = toLatitudeString(data.geo.lat,'plain') + ', ' + toLongitudeString(data.geo.lng,'plain');
        data.address = data.geo.address;
      }
      data.ayanamsaDegrees = parseAstroResult(data.ayanamsa,'lng');
      data.ayanamsaName = "";
      if (vars.ayanamsas.hasOwnProperty(data.ayanamsaNum)) {
        data.ayanamsaName = vars.ayanamsas[data.ayanamsaNum];
      }
      app.dashaData = data;
      app.dashaData.valid = true;
      if (dKey) {
        if (typeof dKey == 'string') {
          storeItem(dKey,app.dashaData);
        }
      }
      setTimeout(function(){
        AstroIQ.addListCollapse();
      }, 500);
    },
    loadDashas: function() {
      var params = {
        years: 120,
        personId: this.personId,
        ayanamsa: this.options.ayanamsa,
        mode: this.options.mode
      };
      var dKey = 'da_' + this.personId + '_' + params.ayanamsa+ '_' + params.mode;
      var stored = getItem(dKey);
      if (stored.valid) {
        this.injectDashas(stored.data);
      } else {
        axios.get('api/dasha-person', {params:params}).then(function(response) {
          if (response.data) {
            if (response.data.dashas) {
              app.injectDashas(response.data,dKey);
            }
          }
        })
        .catch(function(error){
          console.log(error) 
        });
      } 
    },
    showSub: function(pType) {
      this.toggleDegreeMode('display');
      this.subPane = pType;
    },
    showChart: function(cType) {
      this.toggleDegreeMode('display');
      this.chartMode = cType;
    },
    toggleMenu: _.debounce(function(mode) {
      switch (mode) {
        case 'hide':
          this.showTopMenu = false;
          break;
        case 'show':
          this.showTopMenu = true;
          break;
        default:
          this.showTopMenu = !this.showTopMenu;
          break;
      }
      if (this.showTopMenu && this.user.showForm) {
        this.user.showForm = false;
      }
    },25),
    matchDateFormat: function() {
      var fmt = 'DD/MM/YYYY';
      if (this.options.dateFormat) {
        if (typeof this.options.dateFormat == 'string' && /YY/.test(this.options.dateFormat) ) {
          fmt = this.options.dateFormat;
        }
      }
      return fmt + ' HH:mm:ss';
    },
    toggleDegreeMode: function(mode) {
      var sm = this.coordinatesClass;
      switch (mode) {
        case 'display':
          sm = 'display-none';
          break;
        case 'dms':
        case 'dec':
          sm = mode;
          break;
      }
      switch (sm) {
        case 'display':
        case 'dms':
          this.syncDmsControls(false);
          this.syncDmsControls(true);
          this.coordinatesClass = 'show-dms-degrees';
          break;
        case 'show-dms-degrees':
        case 'dec':
          this.coordinatesClass = 'show-dec-degrees';
          break;
        default:
          this.coordinatesClass = 'display';
          break;
      }
    },
    swapDirection: function(isLng) {
      var c = this.location.coords, l;
      if (isLng) {
        l = c.lngComponents
      } else {
        l = c.latComponents
      }
      switch (l.dir) {
        case 'w':
        case 'W':
          if (isLng) {
            l.dir = 'E';
          }
          break;
        case 'e':
        case 'E':
          if (isLng) {
            l.dir = 'W';
          }
          break;
        case 'n':
        case 'N':
          if (!isLng) {
            l.dir = 'S';
          }
          break;
        case 's':
        case 'S':
          if (!isLng) {
            l.dir = 'N';
          }
          break;
      }
    },
    magnifyChart: function(num) {
      if (num < 2) {
        AstroChart.resetChartPos();
      }
      this.chartSizeClass = 'magnify-' + num;
    },
    syncDmsControls: function(isLng) {
      var c = this.location.coords,parts = [], l;
      if (isLng) {
        l = c.lngComponents;
        if (c.lngDms) {
          parts = c.lngDms.split(' ');
        }
      } else {
        l = c.latComponents;
        if (c.latDms) {
          parts = c.latDms.split(' ');
        }
      }
      if (parts.length>3) {
        l.deg = parts[0].toInt();
        l.min = parts[1].toInt();
        l.sec = parts[2].toFloat();
        l.dir = parts[3].toUpperCase();
      }
    },
    showLogin: function(mode) {
      this.user.showForm = true;
      this.toggleMenu('hide');
      if (mode == 'register') {
        this.user.registerMode = "email";
        this.user.submitLabel = "Register";
      } else {
        this.user.registerMode = "login";
        this.user.submitLabel = "Log in";
      }
    },
    processUser: function() {
      switch (this.user.registerMode) {
        case "login":
          this.errorMsg = "";
          var data = {
            username: this.user.username,
            password: this.user.password
          };
          axios.post('/login',data).then(function(response) {
            if (response.data) {
              var data = response.data;
              
              if (data.user) {
                var ud = data.user;
                if (ud.id) {
                  app.user.id = ud.id;
                  app.user.username = ud.username;
                  app.user.isAdmin = ud.isAdmin;
                  app.user.showForm = false;
                  app.user.screenname = ud.screenname;
                  app.user.loggedin = true;
                  app.user.statusMsg = 'Logged in as ' + ud.screenname;
                  storeItem('user',app.user);
                  app.loadUserRecords();
                }
              }
            }
          }).catch(function (error) {
            if (error && !app.user.loggedin) {
              app.user.statusMsg = "Cannot match your username or password";
            }
          });
          break;
        case "email":
          var data = {
            username: this.user.username,
            password: this.user.password,
            cpassword: this.user.cpassword,
            screenname: this.user.screenname
          },
          valid = true;
          if (data.password.length < 7) {
            app.user.errorMsg = "Please enter pass";
          }
          if (data.password !== data.cpassword) {
            valid = false;
            app.user.errorMsg = "Your passwords do not match";
          }
          if (valid) {
            axios.post('/save-user',data).then(function(response) {
              if (response.data) {
                var ud = response.data;
                if (ud.id) {
                  app.user.id = ud.id;
                  app.user.username = ud.username;
                  app.user.showForm = false;
                  app.user.screenname = ud.screenname;
                  app.user.loggedin = true;
                  app.user.statusMsg = 'Thank you for registering as ' + ud.screenname;
                  setTimeout(function() {
                    app.user.statusMsg = 'Logged in as ' + ud.screenname;
                     storeItem('user',app.user);
                  }, 2000);
                }
              }
            }).catch(function (error) {
              app.user.statusMsg = "Cannot match your username or password";
            });
          }
          break;
      } 
      
      this.user.password = "";
      
    },
    logout: function() {
      this.user.id = "";
      this.user.isAdmin = false;
      this.user.username = "";
      this.user.screenname = "";
      this.user.statusMsg = "Logged out";
      this.user.loggedin = false;
      this.user.showForm = false;
      deleteItem('persons');
      deleteItem('user');
      this.deleteLocalRecords();

    },
    loadUserRecords: function() {
      var href = '/api/charts/'+this.user.id+'/full/'+config.storage.maxRecs;
      
      axios.get(href).then(function(response){
        
        if (response.data) {
          
          if (response.data.records instanceof Array) {
            var items=[], i=0,
            persons = {},
            fmt = app.matchDateFormat(),
            numItems=response.data.records.length,cKey,item,ts;
            for (;i<numItems;i++) {
              item = response.data.records[i];
              cKey = 'ch_' + item._id;
              if (i < config.storage.maxRecs) {
                item.chartId = cKey;
                ts = storeItem(cKey,item);
                AstroIQ.addRecord(items,item,cKey,ts,fmt);
              } else {
                break;
              }
            }
          }
          app.addQueryItems(items);
        }
      });
      
    },
    deleteLocalRecords: function() {
      for (k in window.localStorage) {
        if (k.startsWith('ch_')) {
          deleteItem(k);
        }
      }
    }
  }
});


d3.select('#control-panel').on('click',function() {
    var tg = d3.select(d3.event.target), b = d3.select("body"), refCl='show-control-panel';
    if (tg.classed('toggle-aside') || (b.classed(refCl)==false && tg.attr('id')=='control-panel')) {
      d3.event.stopImmediatePropagation();
      if (b.classed(refCl)) {
         b.classed(refCl,false);
      } else {
         b.classed(refCl,true);
      }
    }
});

d3.selectAll('#aspect-controls input.checkbox').on('change',function() {
    var it = d3.select(this), c = d3.select("#chart-pane"),idClass = it.attr('id');
    console.log(idClass)
    c.classed(idClass,it.property('checked'));
});

setTimeout(function(){
  pDom.geoLocAllowed = GeoMap.geoLocAllowed();

  if (!pDom.geoLocAllowed) {
     AstroIQ.fetchGeoFromIp();
     /*setTimeout(function(){
         pDom.geoLocAllowed = GeoMap.geoLocAllowed();
     }, 10000);*/
  } else {
    setTimeout(function() {
      if (!User.geo.coords) {
          User.geo.coords = {
              lat: d3.select('#form-lat').property('value'),
              lng: d3.select('#form-lng').property('value'),
          };
          app.updateTzFields(User.geo);
      }
    }, 4000);
  }
}, 1000);



AstroIQ.init();

