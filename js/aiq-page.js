initJQueryDateBox// Flipbox
var initJQueryDateBox = function() {
    var scrTag = jQuery('<script type="text/javascript"></script>'),
    jr = jQuery('#jq-resources');
    if (jr.length>0) {
        var vl = jr.val();
        if (vl) {
          var jScripts = vl.split(',');
          if (jScripts.length>1) {
              var s1 = scrTag.clone(),head = jQuery('head').first();
              s1.attr('src',jScripts[0]);
              head.append(s1);
              var s2 = scrTag.clone();
              s2.attr('src',jScripts[1]);
              head.append(s2);
              setTimeout(initDateBox,500);
          }
        }
    }
    
}
var initDateBox = function() {
    jQuery.extend(jQuery.jtsage.datebox.prototype.options.lang, {
  'en': {
        timeFormat: 24,
        dateFieldOrder: ["d", "m", "y"],
        timeFieldOrder: ["h", "i", "a"],
        slideFieldOrder: ["y", "m", "d"],
        dateFormat: "%Y-%m-%d",
        headerFormat: "%A, %-d %B %Y",
      }
    });
    jQuery.extend(jQuery.jtsage.datebox.prototype.options, {
      useLang: 'en'
    });
    var db = jQuery('input.datebox');
    ctrls = jQuery('<div class="mode-controls"><span class="mode disable-datebox"></span></div>');
    db.parent().last().append(ctrls);
    db.datebox();
    ctrls.find('span').on('click',function(e){
      e.stopImmediatePropagation();
      var ctrl = jQuery(this),
      cont = ctrl.parent().parent(), 
      it = cont.find('input.datebox');
      if (it.length>0) {
        var par = it.parent();
        if (par.hasClass('input-group')) {
          cont.parent().find('input.datebox').datebox('destroy');
          cont.parent().find('.ui-datebox-container,.input-group').remove();
        } else {
          if (it.hasClass('clicked')) {
            it.attr('type','text').removeClass('clicked').addClass('plain');
          } else if (it.hasClass('plain')==false) {
            it.addClass('clicked');
          }
        }
      }
    });
    db.on('change',function(){
      if (app) {
        app.dob = jQuery('#form-dob').val();
        app.tob = jQuery('#form-tob').val();
      }
    });
    setTimeout(function(){
      jQuery('.ui-datebox-container').on('click',function(){
        var cont = jQuery(this);
          if (cont.length>0) {
            if (cont.css('display') !== 'none') {
              cont.slideUp();
            }
          }
      });
      jQuery('.datetime').on('mouseleave',function(){
        var cont = jQuery(this).find('.ui-datebox-container');
          if (cont.length>0) {
              cont.slideUp();
          }
      });
    },250);
}

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
        this.addDragendEvent(this.marker);
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
              GeoMap.addDragendEvent(this.marker);
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
            axios.get('/geolocate/'+ strCoords).then(function(response) {
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
          jQuery('#form-lat').val(coords.lat).trigger('change');
          jQuery('#form-lng').val(coords.lng).trigger('change');
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
                var lat = jQuery('#form-lat').val(),
                lng = jQuery('#form-lng').val();
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
 

  fetchGeoFromIp: function() {
    var geoData = getItem('geodata',3600);
    if (geoData.valid == false) {
        axios.get('/geoip').then(function(data) {
            if (data.coords) {
              User.geo.coords = data.coords;
              storeItem('geodata',data);
              GeoMap.updateAddress(data);
              app.updateTzFields(data);
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
      bns=["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto","ketu","rahu","pallas","ceres","juno"],
      i=0,
      nb = bns.length;
      for (;i<nb;i++) {
        bodies.push({key:bns[i],lng: 0,lat: 0,spd: 0,glat:0,glng: 0,gspd:0});
      }      
      return bodies;
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
          options.ayanamsa = parseInt(options.ayanamsa);
        } else {
          ayanamsa = 0;
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
          if (matched) {
            parsed.houses = [];
            parsed.houseLngs = [];
            var nv = matched.values.length,h,lng,end;
            if (nv > 1) {
              for (i=0; i < (nv*2); i++) {
                
                if (i < nv) {
                  lng = parseFloat(matched.values[i]);
                } else {
                  lng = (parseFloat(matched.values[(i-nv)]) + 180) % 360;
                }
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
    return parsed;
  },

  loadGMap: function(focus,lat,lng) {
    var gMapApi = jQuery('#gmap-api-key');
    if (gMapApi.length>0) {
      var gMapApiKey = gMapApi.val(),
        st = jQuery('#gmap-core');

      if (st.length < 1 && gMapApiKey) {
         st = jQuery('<script id="gmap-core" async defer src="https://maps.googleapis.com/maps/api/js?key='+gMapApiKey+'&callback=initMap"></script>');
          jQuery('body').append(st);
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
    
  }
}

function initMap() {
    return GeoMap.init();
}

var EphemerisData = {
  valid: false,
  name: "",
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
  cmd: ""
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
      registerMode: "",
      submitLabel: "Log in!",
      name: "",
      id: "",
      type: "",
      isAdmin: false
    },
    recordId: null,
    recordEditable: false,
    personEditable: false,
    newRecord: false,
    newPerson: false,
    personId: null,
    chartType: "birth",
    eventType: "",
    eventTitle: "",
    candidateName: "",
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
    options: {
      ayanamsa: "-",
      hsy: "W",
      rodden: "-",
      mode: 'topo',
      layout: "western"
    },
    queries: [],
    chartData: {
      active: false,
      name: '',
      dateStr: '',

    },
    coordinatesClass: 'display',
    activeTab: 'chart',
    subPane: 'form',
    chartSizeClass: 'magnify-1',
    chartMode: 'western',
    showTopMenu: false,
    toggleMenuMessage: "Show main menu",
    results: EphemerisData,
    currId: null
  },
  created: function() {
    
    var c = this.location.coords;
    
    
    if (localStorageSupported()) {
      var items = [], item,li;
      for (k in window.localStorage) {
        if (k.indexOf('b=') >= 0 && k.indexOf('b=') <= 2) {
          item = getItem(k);
          if (item.valid) {
            li = {
              ts: item.ts,
              paramStr: k,
              name: item.data.name,
              dateStr: dateStringFormatted(item.data.datetime),
              datetime: item.data.datetime,
              address: item.data.address
            };
            items.push(li);
          }
        }
      }
      items = items.sort(function(a,b){
        return b.ts - a.ts
      });
      for (var i=0;i<items.length;i++) {
        this.queries.push(items[i]);
      }
      this.initDate();
      c.latDms = toLatitudeString(this.location.coords.lat,'plain');
      c.lngDms = toLongitudeString(this.location.coords.lng,'plain');
      this.updateDms(c,false);
      this.updateDms(c,true);
      axios.get('/person-names-all').then(function(response){
        if (response.data instanceof Array) {
          app.people.persons = response.data;
          app.people.num = app.people.persons.length;
        }
      });
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
    matchPerson: function() {
      var txt = this.candidateName.trim(),numSelected=0;
      if (txt.length > 0) {
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
        this.candidateName = person.name;
        this.personId = person.id;
        this.personEditable = true;
        this.resetPersons();
      }
    },
    assignResults: function(data) {
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
      if (this.results.name) {
        this.candidateName = this.results.name;

      }
      if (this.results.geo.lat) {
        var geo = this.results.geo;
        this.location.coords.lat = geo.lat;
        this.location.coords.lng = geo.lng;
        this.location.coords.alt = geo.alt;
        this.location.address = geo.address;
        jQuery('#location-address').val(geo.address);
        jQuery('#form-location').val('');
        this.location.search = '';
        this.results.geo.display_coords = toLatitudeString(geo.lat,'plain') + ', ' + toLongitudeString(geo.lng,'plain')
      }
      if (this.results.datetime) {
        if (/^\d\d\d\d-\d\d-\d\d?/.test(this.results.datetime)) {
          if (data.dateinfo) {
            var dt =  new Date(this.results.datetime);
            dt.setSeconds(dt.getTimezoneOffset() * 60);
            this.results.dateinfo.tz = data.dateinfo.zone;
            if (data.dateinfo.hasOwnProperty('gmtOffset')) {
                
                this.results.dateinfo.gmtOffset = data.dateinfo.gmtOffset;
                dt.setSeconds(data.dateinfo.gmtOffset);
                this.results.dateinfo.datetime = dt;
                this.results.dateinfo.info =   data.dateinfo.zone + ' UTC ' + secondsToHours(this.results.dateinfo.gmtOffset);
                this.results.dateinfo.display =  dt.dmy('m');
            }
            var parts = this.results.dateinfo.datetime.ymd('s').split(' ');
            if (parts.length>1) {
              this.dob = parts[0];

              var tob = parts[1];
              if (typeof tob == 'string') {
                parts = tob.split(':');
                if (parts.length>1) {
                  this.tob = parts[0]+':'+parts[1];
                }
              }
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
      if (data.id) {
        this.recordId = data.id;
        this.recordEditable = data.id.length>10;
      }
      if (data.gender) {
        this.gender.type = data.gender;
      }
      if (this.results.cmd) {
        this.results.cmd = this.results.cmd.replace(/_+/g,' ');
      }
    },
    searchLocation: function() {
      this.location.showAddress = false;
      
      if (this.location.search.length>0) {
          var adStr = this.location.search.trim(),
            href = '/geocode/' + adStr,
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
                jQuery('#location-address').val(data.address);
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
              jQuery('#location-address').val(name);
            }
          }
        }
      }
    },
    findOnMap: function() {
      var strCoords = this.location.coords.lat +'/'+this.location.coords.lng;
      axios.get('/geolocate/'+ strCoords).then(function(response) {
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
          params.lc = lngV + ',' + latV + ',' + altV;

          params.dt = dobV+'T'+tobV;
          
          params.name = this.candidateName.trim();
          params.chartType = this.chartType;
          var genderVal = this.gender.type;
          if (this.gender.type == 'other') {
            genderVal = this.gender.otherType;
          }
          params.address = this.location.address;
          params.gender = genderVal;
          /*var paramStr = toParamString(params,['address']),
          stored = getItem(paramStr);*/
          var update = false;
          if (this.newRecord !==true && this.recordEditable === true) {
            if (typeof this.recordId == 'string') {
              params.id = this.recordId;
              update = true;
            }
          }
          this.loadQuery(params,update);
          
      }
    },
    updateChartData: function(data) {
      this.toggleDegreeMode('display');
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
        } else if (data.geo) {
          if (data.geo.address) {
            this.chartData.address = data.geo.address;
          }
        } else if (data.location) {
          if (data.location.address) {
            this.chartData.address = data.location.address;
          }
        } else {
          this.chartData.address = "";
        }
      } else {
        this.chartData.active = false;
      }
      if (this.activeTab == 'map') {
        var c = this.location.coords;
          GeoMap.updateMap(c.lat,c.lng,true,false);
      }
      AstroChart.updateHouses(data.houseLngs);
      AstroChart.moveBodies(data.bodies);
    },
    loadQuery: function(paramStr, update) {
      if (typeof paramStr == 'object') {
        var params = paramStr, hasData = false;
        paramStr = toParamString(paramStr,['id']);
      } else {
        var params = fromParamStr(paramStr);
      }
      jQuery('#form-location').val('');
      app.location.search = '';
      if (update !== true) {
        var stored = getItem(paramStr);
        if (stored.valid) {
            this.assignResults(stored.data);
            this.updateChartData(stored.data);
            hasData = true;
            this.currId = paramStr;
        }
      }
      if (!hasData) {
        axios.get('/astro-json', {
          params: params
        })
        .then(function (response) {
          if (response.data) {
            var data = AstroIQ.parseResults(response.data,app.options);
            console.log(data)
            app.assignResults(data);
            app.activeTab = 'chart';
            app.updateChartData(data);
            var item = {
              paramStr: paramStr,
              name: data.name,
              dateStr: dateStringFormatted(data.datetime),
              datetime: data.datetime,
              address: data.geo.address
            };
            if (!update) { 
              app.queries.unshift(item);
            } else {
              deleteItem(app.currId);
              app.replaceQuery(app.currId,item);
            }
            storeItem(paramStr,data);
            app.currId = paramStr;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      }
      app.showSub('form'); 
    },
    matchQuery: function(paramStr) {
      return _.findIndex(this.queries,['paramStr',paramStr]);
    },
    deleteQuery: function(paramStr,subPane) {
      var matched = this.matchQuery(paramStr);
      if (matched >= 0) {
        this.queries.splice(matched,1);
      }
      deleteItem(paramStr);
      if (subPane) {
        this.showSub('queries');
      }
    },
    replaceQuery: function(paramStr,updatedItem) {
      var matched = this.matchQuery(paramStr);
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
      }
      this.activeTab = pType;
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
      
    },25),
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
        this.user.registerMode = "";
        this.user.submitLabel = "Log in";
      }
    },
    login: function() {
      //
    },
    logout: function() {
      //
    }
  }
});

(function($) {

    $( document ).ready(function() {
        AstroChart.init();

        var p = pDom;
        p.body = $('body');
        p.window = $(window);
        p.width = p.window.width();
        p.height = p.window.height();
        p.mobileMax = 959;
        p.medDesktopMin = 1280;
        


        p.window.on('resize',function() {
          var p = pDom;
          p.width = p.window.width();
          p.height = p.window.height();
        });

        $('#control-panel fieldset .toggle').on('click',function(e){
            var par = $(this).parent();
            e.stopImmediatePropagation();
            if (par.hasClass('closed')) {
                par.parent().find('fieldset.collapsible.open').removeClass('open').addClass('closed');
                par.removeClass('closed').addClass('open');
            } else {
                par.removeClass('open').addClass('closed');
            }
        });

        /*$('#control-panel .symbol-radio').on('click',function(e){
            var it = $(this), radio = it.find('input[type=radio]');
            e.stopImmediatePropagation();
            if (radio.length > 0) {
                if (radio.is(':checked') == false) {
                    it.parent().find('span.checked').removeClass('checked');
                    it.addClass('checked');
                    it.parent().find('input[type=radio]').prop('checked',false);
                    radio.prop('checked',true);
                }
                
            } 
        });*/

        $('#control-panel').on('click',function(e) {
            var tg = $(e.target), b = pDom.body, refCl='show-control-panel';
            if (tg.hasClass('toggle-aside') || (b.hasClass(refCl)==false && tg.attr('id')=='control-panel')) {
              e.stopImmediatePropagation();
              if (b.hasClass(refCl)) {
                 b.removeClass(refCl);
              } else {
                 b.addClass(refCl);
              }
            }
        });

        

        if (p.width > p.medDesktopMin) {
          p.body.addClass('show-control-panel');
        }

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
                      lat: $('#form-lat').val(),
                      lng: $('#form-lng').val()
                  };
                  app.updateTzFields(User.geo);
              }
            }, 4000);
          }
        }, 1000)

        if (screen.width > p.mobileMax) {
          // setTimeout(initJQueryDateBox, 250);
        }       
    });
})(jQuery);
