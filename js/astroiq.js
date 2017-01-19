// Flipbox
var initJQueryDateBox = function() {
    var scrTag = jQuery('<script type="text/javascript"></script>'),
    jr = jQuery('#jq-resources');
    if (jr.length>0) {
        var jqui = jr.attr('data-jqui'),
            jqdb = jr.attr('data-jqdb');
        if (jqui !== undefined && jqdb !== undefined) {
            var s1 = scrTag.clone(),head = jQuery('head').first();
            s1.attr('src',jqui);
            head.append(s1);
            var s2 = scrTag.clone();
            s2.attr('src',jqdb);
            head.append(s2);
            setTimeout(initDateBox,500);
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
    jQuery('input.datebox').datebox();
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
      jQuery('#form-lat').val(data.coords.lat.toString());
      jQuery('#form-lng').val(data.coords.lng.toString());
      User.geo = data;
      pDom.geoAddress.text(data.name + ', ' + data.countryName).removeClass('hidden');
      jQuery('#form-lat').trigger('change');
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

    updateMap: function(lat,lng,updateMarker,animateZoom) {
        var pos = {
           lat: lat,
           lng: lng 
        };
        this.map.setCenter(pos);
        var ts = GeoMap.hasMap? 25 : 500;
        setTimeout(GeoMap.showSatellite, ts);
        if (animateZoom !== false) {
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
        if (updateMarker) {
            this.marker.setPosition(pos);
            this.addDragendEvent(this.marker);
        }
    },

    showSatellite: function() {
      if (GeoMap.hasMap) {
        GeoMap.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      }
    },

    matchLocation: function(position) {
        if (position.coords) {
            User.geo.coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            var strCoords = User.geo.coords.lat + '/' + User.geo.coords.lng;
            jQuery.ajax({
                url: '/geolocate/'+ strCoords,
                success: function(data) {
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
                latitude: coords,
                longitude: lng
            };
        }
        /*document.getElementById('form-lat').setAttribute('value',coords.latitude);
        document.getElementById('form-lng').setAttribute('value',coords.longitude);*/
        jQuery('#form-lat').val(coords.latitude).trigger('change');
        jQuery('#form-lng').val(coords.longitude).trigger('change');

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
                if (/^\s*-?\d+/.test(lat) && /^\s*-?\d+/.test(lng)) {
                    lat = parseFloat(lat);
                    lng = parseFloat(lng);
                    GeoMap.buildMap(lat,lng);
                }
            }
        },500);
    }
};

var AstroIQ = {
  buildBodyDataView: function(body,key) {
    var ul = jQuery('<ul class="details-'+key+'"></ul>'),hasData=false,content, li, tp;
    for (k in body) {
        hasData = false;
        tp = typeof body[k];
        if (tp == 'object') {
            content = objToString(body[k]);
        } else {
            content = body[k];
        }
        if (content) {
            hasData = true;
            li = jQuery('<li class="'+k+'"><strong class="label">'+k+':</strong> <span class="value">'+content+'</span></li>');
        }
        if (hasData) {
            ul.append(li);
        }
    }
    return ul;
  },

  buildDataView: function(data) {
    var dl = jQuery('<dl id="astro-data"></dl>'),
    info = jQuery('<dl id="astro-info"></dl>'),
    dt,dd,hasData,dataType,kn;
    for ( k in data) {
        kn = k;
        if (k != 'house_bounds') {
           dt = jQuery('<dt class="'+k+'">'+k.split('_').join(' ')+'</dt>');
            hasData = false;
            dd = jQuery('<dd class="'+k+'"></dd>');
            dataType = typeof data[k];
            switch (dataType) {
                case 'string':
                case 'number':
                    hasData = true;
                    dd.text(data[k]);
                    break;
                case 'object':
                    hasData = true;
                    dd.append(AstroIQ.buildBodyDataView(data[k],k));
                    break;
            }
            
            if (hasData) {

                switch (kn) {
                    case 'msg':
                        break;
                    case 'swetest':
                    case 'cmd':
                        info.append(dt);
                        info.append(dd);
                        break;
                    default:
                        dl.append(dt);
                        dl.append(dd);
                        break;
                }
            } 
        }
        
        
    }
    jQuery('#results-pane .inner').html(dl);
    jQuery('#results-pane .inner').append(info);
    jQuery('.hor-tabs li.results').removeClass('disabled');
    pDom.infobox.html('').addClass('has-data');
    var p;
    if (data.name && data.datetime) {
      p = ('<p>Name: <strong class="person-name">'+data.name+'</strong>, <em class="datetime">'+dateStringFormatted(data.datetime)+'</em></p>');
      pDom.infobox.append(p);
    }
    if (data.name && data.geo.address) {
      p = ('<p class="location-name" title="'+toLatLngLabel(data.geo)+'">'+data.geo.address+'</p>');
      pDom.infobox.append(p);
    }
  },

  

  fetchGeoFromIp: function() {
    var geoData = getItem('geodata',3600);
    if (geoData.valid == false) {
        jQuery.ajax({
            url: '/geoip',
            success: function(data) {
              if (data.coords) {
                User.geo.coords = data.coords;
                storeItem('geodata',data);
                GeoMap.updateAddress(data);
                AstroIQ.updateTzFields(data);
              }
            }
        });
    } else {
        if (geoData.data) {
            GeoMap.updateAddress(geoData.data);
            AstroIQ.updateTzFields(geoData.data);
        }
    }
  },

  injectGeoNames: function(data) {
    if (data.names) {
      var p=pDom, ol = p.geoAltPlaces.find('ol');
      p.geoAltPlaces.addClass('hidden');
      ol.html('');
      if (data.num > 0) {
        var h,li,i=0,titleStr,nameStr,cn;
        for (; i < data.num;i++) {
          h = data.names[i];
          if (h.name) {
            nameStr = h.name;
            if (h.adminName1.length> 0 && h.adminName1 != h.name && h.adminName1.indexOf(h.name) < 0) {
              nameStr += ', '+h.adminName1;
            }
            if (h.countryName.length > 0) {
              switch (h.countryName) {
                  case 'United Kingdom':
                      cn = 'UK';
                      break;
                  case 'United States':
                      cn = 'USA';
                      break;
                  default:
                      cn = h.countryName;
                      break;
              }
              nameStr += ', '+ cn
            }
            titleStr = toLatLngStr(h.coords);
            if (h.population) {
              titleStr += ', pop: ' + h.population;
            }
            li = jQuery('<li>'+ nameStr +'</li>');
            li.attr({
              title: titleStr,
              'data-coords': h.coords.lat+','+h.coords.lng
            })
            if (h.matched) {
              li.addClass('selected');
            }
            ol.append(li);
          }
        }
        if (data.num > 1) {
          p.geoAltPlaces.removeClass('hidden');
        }
        p.geoAltPlaces.find('h3.toggle em').text('('+data.num+')');
      }
    }
  },

  updateChart: function(data) {
    if (astroDisc) {
        if (data.house_bounds) {
            var i=0,houses=[],end=0,h;
            for (;i<data.house_bounds.length;i++) {
                h = data.house_bounds[i];
                if (typeof h == 'object') {
                    if (i==0) {
                        end = h.lng;
                    }
                    houses.push(h.lng);
                }
            }
            if (end == 0) {
                end = 360;
            }
            houses.push(end);
            astroDisc.ascendant = data.astro.ascendant;
            astroDisc.tweenSegments(houses);
        }
        if (data.bodies) {
            astroDisc.tweenBodies(data.bodies);
        }
    }
  },

  appendAyamansa: function(params) {
    var href = '/ayanamsa';
    jQuery.ajax({
        url: href,
        data: params,
        success: function(data) {
            var dl = jQuery('#astro-data');
            if (dl.length > 0) {
                var dt = jQuery('<dt class="ayanamsa">Ayanamsa</dt>'),
                    dd = jQuery('<dd class="ayanamsa">'+data.ayanamsa+'</dd>');
                dl.append(dt);
                dl.append(dd);
            }
        }
    });
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

  updateDegreeValues: function() {
    var degFields = jQuery('input.degree'),
      numDegFields = degFields.length,i=0,fd,par,vl,dv,dt;
    if (numDegFields>0) {
        for (;i<numDegFields;i++) {
            fd = degFields.eq(i);
            vl = fd.val();
            if (isNumeric(vl)) {
                par = fd.parent();
                if (fd.hasClass('latitude')) {
                    dv = toLatitudeString(vl);
                } else {
                    dv = toLongitudeString(vl);
                }
                dt = par.find('.degrees-dms');
                if (dt.length<1) {
                    dt = jQuery('<strong class="degrees-dms"></strong>');
                    par.append(dt);
                    par.addClass('has-dms');
                }
                dt.html(dv);
            }
        }
    }
  },

  addQueryList: function() {
    var p = pDom;
    if (p.queries) {
      p.queryList = p.queries.find('ol.query-list');
      if (p.queryList.length<1) {
        p.queryList = jQuery('<ol class="query-list"></ol>');
        p.queries.append(p.queryList);
      }
    }
  },

  buildQueryListItem: function(data,paramStr) {
    var li = '<li><a href="/sweph?'+paramStr.replace(/^&/,'')+'">'+data.name + ': ' + dateStringFormatted(data.datetime) +'</a> <span class="delete" title="Remove item">-</span></li>';
    return jQuery(li);
  },

  showData: function(data,paramStr) {
    jQuery('#main .hor-tabs li.chart').first().trigger('click');
    var p =pDom;
    if (p.width < p.medDesktopMin) {
      p.body.removeClass('show-control-panel');
    }
    AstroIQ.buildDataView(data);
    AstroIQ.updateChart(data);
    if (paramStr) {
      if (typeof paramStr == 'string') {
        storeItem(paramStr,data);
        AstroIQ.addQueryList();
        p.queryList.append(AstroIQ.buildQueryListItem(data,paramStr));
      }
    }
  },

  loadGMap: function(focus,lat,lng) {
    var gMapApi = jQuery('#gmap-api-key');
    if (gMapApi.length>0) {
      var gMapApiKey = gMapApi.attr('data-key'),
        st = jQuery('#gmap-core');
      if (st.length < 1 && gMapApiKey) {
         st = jQuery('<script id="gmap-core" async defer src="https://maps.googleapis.com/maps/api/js?key='+gMapApiKey+'&callback=initMap"></script>');
          jQuery('body').append(st);
      }
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

function initMap() {
    return GeoMap.init();
}

var app = new Vue({
  el: '#astroiq',
  data: {
    chartType: "birth",
    gender: {
      rowClasses: "gender-row expanded",
      type: "unknown",
      otherTypeClasses: "gender-other-type hidden"
    },
    dob: '2017-01-01',
    dateLabel: "Date and time of birth",
    location: {
      search: "",
      addressClasses: "location-address collapsed",
      address: "",
      coords: {
        lat: 65.15,
        lng: -13.667
      }
    },
    geonames: {
      divClass: 'hidden',
      items: [],
      num: 0
    },
    hospitals: {
      divClass: 'hidden',
      items: [],
      num: 0
    }
  },
  computed: {
    dob: function() {
      var cDate = new Date().toISOString().split('T').shift(),
      year = cDate.split('-').shift() - 0;
      year -= 20;
      var dStr = cDate.replace(/^\d\d+-/,year + '-');
     return dStr;
    },
    latDms: function() {
      return toLatitudeString(this.location.coords.lat,'plain');
    },
    lngDms: function() {
      return toLongitudeString(this.location.coords.lng,'plain');
    }

  },
  watch: {
    chartType: function() {
      switch (this.chartType) {
        case 'birth':
          this.gender.rowClasses = 'gender-row expanded';
          this.dateLabel = 'Date and time of birth';
          break;
        default:
          this.dateLabel = 'Date and time';
          this.gender.rowClasses = 'gender-row collapsed';
          break;
      }
    },
    'gender.type': function() {
      switch (this.gender.type) {
        case 'other':
          this.gender.otherTypeClasses = "gender-other-type";
          break;
        default:
          this.gender.otherTypeClasses = "gender-other-type hidden";
          break;
      }
    }
  },
  methods: {
    searchLocation: function() {
      var app = this;
      this.location.addressClasses = 'location-address collapsed';
      
      if (this.location.search.length>0) {
          var adStr = this.location.search.trim(),
            href = '/geocode/' + adStr,
            key = 'geocode' + adStr.replace(/\s+/g,'_');
          var stored = getItem(key);
          if (stored.valid) {
            this.updateGeoDetails(stored.data);
          }
          jQuery.ajax({
              url: href,
              success: function(data) {
                  var msg = '';
                  if (data.valid) {
                      app.updateGeoDetails(data,key);
                  } else if (data.message) {
                      msg = data.message;
                  }
                  if (data.has_geonames) {
                      AstroIQ.injectGeoNames(data.geonames);
                      if (data.geomatched_index === 0) {
                         var matchedGeo = data.geonames.names[data.geomatched_index]; 
                         AstroIQ.updateTzFields(matchedGeo);
                      }
                  };
                  if (msg.length > 1) {
                      this.location.address = msg;
                      this.location.addressClasses = 'collapsed';
                      if (data.message && !data.valid) {
                          setTimeout(function() {
                              pDom.geoAddress.addClass('hidden');
                          },5000);
                      }
                  }

              }
          });
      }
    },
    updateGeoDetails: function(data,key) {
      if (data.lat) {
        var lat = data.lat,lng = data.lng;
        this.location.coords.lat = lat;
        this.location.coords.lng = lng;
      }
      this.hospitals.divClass = 'hidden';
      this.hospitals.items = [];
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
          this.hospitals.divClass = 'show';
        }
      }
      if (data.geonames) {
        if (data.geonames.num > 0) {
          var i=0,h,li,nameParts=[],skipCountry=false,cName='';
          for (; i < data.geonames.num;i++) {
            h = data.geonames.names[i];
            skipCountry = false;
            cName = '';
            if (h.name) {
              nameParts = [h.toponymName];
              if (h.adminName1.length > 1) {
                if (h.adminName1 != h.countryName) {
                  nameParts.push(h.adminName1);
                  switch (h.adminName1.toLowerCase()) {
                    case 'scotland':
                    case 'england':
                    case 'wales':
                      skipCountry;
                      break;
                  }
                }
                if (!skipCountry) {
                  switch (h.countryCode) {
                    case 'US':
                      cName = 'USA';
                      break;
                    case 'UK':
                      cName = 'UK';
                      break;
                    default:
                      cName = h.countryName;
                      break;
                  }
                  nameParts.push(cName);
                }
              }
              li = {
                coords: h.coords.lat+','+h.coords.lng,
                name: nameParts.join(', ')
              };
              this.geonames.items.push(li);
            }
          }
          this.geonames.num = data.geonames.num;
          this.geonames.divClass = 'show';
        }
      }
      if (GeoMap) {
         if (GeoMap.map !== null) {
              GeoMap.updateMap(lat, lng, true);
          } else {
              AstroIQ.loadGMap(true,lat,lng);             
          }
          jQuery('#main .hor-tabs li.map').trigger('click');
      }
      if (key) {
        if (typeof key == 'string') {
          storeItem(key,data);
        }
      }
      
    },
    updateMap: function(coords) {
      if (coords) {
        var parts = coords.split(',');
        if (isNumeric(parts[0]) && isNumeric(parts[1])) {
          parts[0] = parseFloat(parts[0]);
          parts[1] = parseFloat(parts[1]);
          GeoMap.updateMap(parts[0],parts[1],true,false);
        }
        
      }
    }
  }
});

(function($) {

    $( document ).ready(function() {
        astroDisc.init();

        var p = pDom;
        p.body = $('body');
        p.window = $(window);
        p.width = p.window.width();
        p.height = p.window.height();
        p.mobileMax = 959;
        p.medDesktopMin = 1280;
        p.cForm = $('form#control-form');
        p.queries = $('#queries');
        p.infobox = $('#infobox');
        p.geoBirth = $('#form-geobirth');
        p.geoAddress = $('#geo-address');
        p.geoAltPlaces = $('#geo-alt-places');
        p.geoHospitals = $('#geo-hospitals');
        p.timezoneFs = $('#timezone-settings');
        p.timezoneFsDisplay = p.timezoneFs.find('h3 em');
        p.tzField = $('#form-tz');
        p.dsField = $('#form-ds');
        p.cForm.find('fieldset.listing').on('click',function(e){
          var tg = $(e.target);
          if (tg.prop('tagName').toLowerCase() == 'li') {
            var coords = tg.attr('data-coords');
            if (coords) {
              var parts = coords.split(',');
              if (isNumeric(parts[0]) && isNumeric(parts[1])) {
                parts[0] = parseFloat(parts[0]);
                parts[1] = parseFloat(parts[1]);
                tg.parent().find('.selected').removeClass('selected');
                tg.addClass('selected');
                GeoMap.updateMap(parts[0],parts[1],true,false);
              }
              
            }
          }
        });

        p.window.on('resize',function() {
          var p = pDom;
          p.width = p.window.width();
          p.height = p.window.height();
        });


        p.geoFinder = $('#geobirth-finder');
        if (p.geoFinder.length>0) {
            p.geoBirth.on('click',function() {
                $('#main .hor-tabs li.map').trigger('click');
                GeoMap.showSatellite();
            });
            p.geoFinder.on('click', function(e){
                e.preventDefault();
                
            });
        }

        

        //$('input.degree').on('change keyup',AstroIQ.updateDegreeValues);

        p.cForm.on('submit',function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var dob =$('#form-dob'),
            name = $('#form-name'),
            tob =$('#form-tob'),
            lng = $('#form-lng'),
            lat = $('#form-lat'),
            alt = $('#form-alt'),
            hsy = $('#form-hsy'),
            aya = $('#form-ayanamsa'),
            mod = $('#form-mode input.mode:checked'),
            address=pDom.geoAddress.text().trim();

            if (dob.length>0 && lng.length>0) {
                var dobV = dob.val(),
                tobV = tob.val(),
                lngV = lng.val(),
                latV = lat.val(),
                altV = alt.val();
                lngV = roundDecimal(lngV,5);
                latV = roundDecimal(latV,5);
                var href='/sweph',params={},
                geopos = lngV + ',' + latV + ',' + altV,
                isGeo = false;
                params.b = toEuroDate(dobV);
                params.ut = toSwissEphTime(tobV);
                params.elev = alt.val();
                if (mod.length>0) {
                    isGeo = mod.val() == 'geo';
                }
                if (isGeo) {
                    params.geopos = geopos;
                } else {
                    params.topo = geopos;
                }
                if (hsy.length>0) {
                    params.system = hsy.val();
                }
                if (aya.length>0) {
                    params.sid = aya.val();
                }
                params.name = name.val().trim();
                var gender = $(this).find("input[name='gender']:checked"),
                genderVal = 'unknown';
                if (gender.length>0) {
                  genderVal = gender.val().trim();
                }
                params.address = address;
                params.gender = genderVal;
                var paramStr = toParamString(params,['address']),
                stored = getItem(paramStr);
                if (stored.valid) {
                  AstroIQ.showData(stored.data);
                } else {
                  $.ajax({
                      url: href,
                      data: params,
                      success: function(data) {
                          if (data.valid) {
                              AstroIQ.showData(data,paramStr);
                          }
                      }
                  });
                }
                
            }

        });
        
        p.horMenu = $('#main .hor-tabs');
        p.horMenu.find('li').on('click',function(e){
            e.stopImmediatePropagation();
            var it = $(this), main = $('#main');
            if (it.hasClass('active') == false) {
                var cl = it.attr('class');
                if (cl) {
                   var pane = $('#'+cl.split(' ').shift() + '-pane');
                   if (pane.length>0) {
                        main.find('> .active').removeClass('active').addClass('behind');
                        pane.removeClass('behind').addClass('active');
                        it.parent().find('.active').removeClass('active');
                        it.addClass('active');
                   }
                }
            }
            if (it.hasClass('chart')) {
                if (it.hasClass('indian')) {
                    $('#astro-disc').addClass('show-indian').removeClass('show-european');
                } else if (it.hasClass('european')) {
                    $('#astro-disc').addClass('show-european').removeClass('show-indian');
                }
                it.parent().find('li.active').removeClass('active');
                it.addClass('active');
            }
            if (it.hasClass('map')) {
                if (GeoMap.map) {
                  GeoMap.focus();
                } else {
                  AstroIQ.loadGMap(true);
                }
            }
        });

        $('#control-panel fieldset .toggle').on('click',function(e){
            var par = $(this).parent();
            e.stopImmediatePropagation();
            if (par.hasClass('closed')) {
                par.removeClass('closed').addClass('open');
            } else {
                par.removeClass('open').addClass('closed');
            }
        });

        $('#control-panel .symbol-radio').on('click',function(e){
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
        });

        $('#form-height-unit').on('change',function(e){
            var it = $(this), par = it.parent(),
                vl = $(this).val(),ref = par.find('#form-alt');
            if (ref.length>0) {
                var mToFt = 0.3048, 
                  ftRound = 25,
                  mRound = 10,
                h = ref.val().toInt(),nh;
                if (h !== 0) {
                    if (vl == 'm' && par.hasClass('show-ft')) {
                        nh = parseInt(Math.ceil(h * mToFt) / mRound) * mRound;
                        step = 10;
                    } else if (vl == 'ft' && par.hasClass('show-ft')==false) {
                        nh = Math.ceil( (h/ftRound) / mToFt) * ftRound;
                        step = 25;
                    }
                    par.removeClass('show-ft show-m').addClass('show-' + vl);
                    if (isNumeric(nh)) {
                        ref.val(nh).attr('step',step);
                    }
                }
            }    
        });

        //AstroIQ.updateDegreeValues();

        $('p.has-mask input.main').on('click change',function(e){
            var p=pDom;
            if (p.width > p.mobileMax) {
              var it=$(this),
              par=it.parent()
              if (par.hasClass('input-group')) {
                  par = par.parent();
              }
              var id=it.attr('id'),
              mask=par.find('#'+id+'-mask');
              switch (e.type) {
                  case 'click':
                      if (mask.length>0) {
                          var wdg = par.find('.ui-datebox-container');
                          if (wdg.css('display') != 'block') {
                             mask.removeClass('hidden');
                              par.addClass('masked');
                              var tg = mask[0], 
                              vl = mask.val(),
                              start = tg.selectionStart,
                              end = tg.selectionEnd,
                              len=vl.length; 
                          }
                      }
                      break;
                  case 'change':
                      var vl = it.val(),valid=false;
                      if (mask.hasClass('date-mask')) {
                          vl = vl.split('-').reverse().join('/');
                      }
                      mask.val(vl);
                      break;
              }
            }
            
        });
        $('p.has-mask input.mask').on('change',function(e){
            var it=$(this),par = it.parent(), main = par.find('.main');
            if (main.length>0) {
                var vl = it.val(),rs;
                if (it.hasClass('time-mask')) {
                    vl = vl.replace(/[.,]+/g,':');
                    vl = vl.replace(/^(\d):/g,'0$1:');
                    vl = vl.replace(/:(\d)$/g,':0$1');
                    vl = vl.replace(/:$/g,':00');
                    vl = vl.replace(/(:[0-9][0-9])[0-9]+/g,"$1");
                } else {
                    vl = vl.replace(/[ .,-]+/g,'/');
                }
                vl = vl.replace(/^:/,'0:');
                if (it.hasClass('time-mask')) {
                    rs = '^\\d\\d?:\\d\\d?$';
                } else {
                    rs = '^[0123]?\\d/[01]?\\d?/(1[789]|20)\\d\\d$';
                }
                var rgx = new RegExp(rs);
                if (rgx.test(vl)) {
                    if (it.hasClass('date-mask')) {
                        vl = vl.split('/').reverse().join('-');
                    }
                    main.val(vl); 
                }
            }
        }).on('keyup blur',function(e){
            
            var it=$(this),vl=it.val(),
            /*start = e.target.selectionStart,
            end = e.target.selectionEnd,*/
            len=vl.length,
            tp = it.hasClass('time-mask')? 'time' : 'date';
            /*if (len == 5) {
                if (start < (len-1) && start==end) {
                    e.target.selectionEnd = end + 1;
                }
            }*/
            if (e.type =='blur') {
                if (tp == 'time') {
                   vl = vl.replace(/[.,]+/g,':');
                    vl = vl.replace(/:$/g,':00');
                    vl = vl.replace(/(:[0-9][0-9])[0-9]+/g,"$1");
                    vl = vl.replace(/^:/,'0:'); 
                } else {
                    vl = vl.replace(/[ .-]+/g,'/');
                    vl = vl.replace(/[^0-9\/]+/g,'');
                    vl = vl.replace(/\/$/g,':01');
                    vl = vl.replace(/\b([0-9])\//g,"0$1");
                    vl = vl.replace(/\/(\d\d)$/,'/19$1');
                }
                
            }
            if (e.type =='keyup') {
                if (tp == 'time') {
                    vl = vl.replace(/[^0-9:.,]/g,'');
                    vl = vl.replace(/(\d)[.,](\d)/g,'$1:$2');
                    vl = vl.replace(/:[6-9]([0-9])$/g,'5$1');
                    vl = vl.replace(/^[3-9]([0-9]):/g,'1$1');
                }
            }
            it.val(vl);
        });
        $('p.has-mask').on('mouseleave',function(e) {
            var par = $(this), mask = par.find('.mask');
            mask.addClass('hidden');
            par.removeClass('masked');
        });

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

        if (localStorageSupported()) {
          AstroIQ.addQueryList();
          var item,li;
          for (k in window.localStorage) {
            if (k.indexOf('b=') >= 0 && k.indexOf('b=') <= 2) {
              item = getItem(k);
              if (item.valid) {
                li = AstroIQ.buildQueryListItem(item.data,k);
                p.queryList.append(li);
              }
            }
          }
        }

        p.queries.on('click',function(e){
          var tg = $(e.target);
          if (tg.prop('tagName').toLowerCase() == 'a') {
            e.preventDefault();
            e.stopImmediatePropagation();
            var paramStr = tg.attr('href').split('/sweph?').pop(),
            stored = getItem(paramStr);
            if (stored.valid) {
              showData(stored.data);
            } 
          }
          if (tg.prop('tagName').toLowerCase() == 'span' && tg.hasClass('delete')) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var lk = tg.parent().find('a:first');
            if (lk.length>0) {
              var paramStr = lk.attr('href').split('/sweph?').pop(),
              deleted = deleteItem(paramStr);
              if (deleted) {
                lk.parent().remove();
              } 
            }
          }
        });
        p.geoLocAllowed = GeoMap.geoLocAllowed();
        
        if (!p.geoLocAllowed) {
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
                AstroIQ.updateTzFields(User.geo);
            }
          }, 5000);
        }

        if (screen.width > p.mobileMax) {
            initJQueryDateBox();
        }       
    });
})(jQuery);