(function($) {
    $( document ).ready(function() {
        var ln1 = $('#line-1'), ln2 = $('#line-2');

        var degs = Math.random() * 360;
        degs = parseInt(degs);
        
        ln1.css('transform','rotate('+degs+'deg)');
        ln2.css('transform','rotate('+(degs+30)+'deg)');

        var cf = $('form#control-form');


        var toEuroDate = function(strDate) {
            return strDate.split("-").reverse().join(".");
        };

        var zeroPad2 = function(num) {
            var isString = typeof num == 'string',
            isNum = typeof num == 'number', str;
            if (isString || isNum) {
               if (isNum && /^\s*\d+\s*$/.test(num)) {
                    num = parseInt(num)
               }
               if (num < 10) {
                    str = '0' + num;
               } else {
                    str = num.toString();
               }
            }
            return str;
        };

        var toSwissEphTime = function(strTime) {
            var parts = strTime.split(":"), t;
            if (parts.length>1) {
                t= zeroPad2(parts[0]) + '.' + zeroPad2(parts[1]);
                if (parts.length>2) {
                    t += zeroPad2(parts[2]);
                }
            }
            return t;
        };

        function objToString(obj) {
            if (typeof obj == 'object') {
                var parts = [], tp;
                for (var sk in obj) {
                    tp = typeof obj[sk];
                    switch (tp) {
                        case 'string':
                        case 'number':
                            parts.push(sk + ': ' + obj[sk]);
                            break;
                    }
                }
                return parts.join(', ');
            }
        }


        var buildBodyDataView = function(body,key) {
            var ul = $('<ul class="details-'+key+'"></ul>'),hasData=false,content, li, tp;
            for (k in body) {
                hasData = false;
                tp = typeof body[k];
                if (key == 'bodies') {
                    console.log(k);
                }
                if (tp == 'object') {
                    content = objToString(body[k]);
                } else {
                    content = body[k];
                }
                if (content) {
                    hasData = true;
                    li = $('<li class="'+k+'"><strong class="label">'+k+':</strong> <span class="value">'+content+'</span></li>');
                } /*else {
                    console.log(k);
                    console.log(typeof body[k]);
                    console.log(body[k]);
                }*/
                if (hasData) {
                    ul.append(li);
                }
            }
            return ul;
        };

        var buildDataView = function(data) {
            var dl = $('<dl id="astro-data"></dl>'),
            info = $('<dl id="astro-info"></dl>'),
            dt,dd,hasData,dataType,kn;
            for ( k in data) {
                kn = k;

                dt = $('<dt class="'+k+'">'+k.split('_').join(' ')+'</dt>');
                hasData = false;
                dd = $('<dd class="'+k+'"></dd>');
                dataType = typeof data[k];
                switch (dataType) {
                    case 'string':
                    case 'number':
                        hasData = true;
                        dd.text(data[k]);
                        break;
                    case 'object':
                        hasData = true;
                        dd.append(buildBodyDataView(data[k],k));
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
            $('#results-pane').html(dl);
            $('#results-pane').append(info);
        };

        var appendAyamansa = function(params) {
            var href = '/ayanamsa';
            $.ajax({
                url: href,
                data: params,
                success: function(data) {
                    var dl = $('#astro-data');
                    if (dl.length > 0) {
                        var dt = $('<dt class="ayanamsa">Ayanamsa</dt>'),
                            dd = $('<dd class="ayanamsa">'+data.ayanamsa+'</dd>');
                        dl.append(dt);
                        dl.append(dd);
                    }
                }
            });
        }


        cf.on('submit',function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var dob =$('#form-dob'),
            tob =$('#form-tob'),
            lng = $('#form-lng'),
            lat = $('#form-lat'),
            alt = $('#form-alt'),
            hsy = $('#form-hsy'),
            aya = $('#form-ayanamsa'),
            mod = $('#form-mode input.mode:checked');
            if (dob.length>0 && lng.length>0) {
                var dobV = dob.val(),
                tobV = tob.val(),
                lngV = lng.val(),
                latV = lat.val(),
                altV = alt.val();
                var href='/sweph',params={},
                geopos = lngV + ',' + latV + ',' + altV,
                isGeo = false;
                params.debug = 1;
                params.b = toEuroDate(dob.val());
                params.ut = toSwissEphTime(tob.val());
                params.elev = alt.val();
                if (mod.length>0) {
                    isGeo = mod.val() == 'geo';
                }
                console.log(isGeo);
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
                
                $.ajax({
                    url: href,
                    data: params,
                    success: function(data) {
                        if (data.valid) {
                            buildDataView(data);
                        }
                    }
                });

            }
        });
    });
})(jQuery);