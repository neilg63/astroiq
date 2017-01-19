var astroDisc = {
    snap: null,

    bounds: [0,30,60,90,120,150,180,210,240,270,300,330,360],

    radius: 600,

    offset: 150,

    colors: ['#882222','#228822','#222288','#777711','#117777','#996633','#669933','#339966','#aa1122','#11aa22','#2211aa','#55aa55'],

    segments: [],

    bodies: [],

    degreeLines: [],

    houseLines: [],

    houseLabels: [],

    indian: null,

    central: null,
    topCircles: null,
    lines: null,
    houseSymbols: [],
    degreeOverlay: null,
    planetarium: null,

    outer: null,
    inner: null,
    disc: null,
    ascendant: 0,
    rd: 57,

    orientation: 'counter',

    calcArcX: function(degs) {
        return (1- Math.sin((90-degs)/this.rd)) * this.radius;
    },

    calcArcY: function(degs) {
        return Math.cos((90-degs)/this.rd) * this.radius;
    },

    calcSegmentD: function(spanDeg,startDeg) {
        var r = this.radius,
            ry = this.calcArcX(spanDeg),
            rx = this.calcArcY(spanDeg);
        return "M0,0 A"+r+","+r+" 0 0,1 "+rx+","+ry+" L0,"+r+" Z";
    },

    calcCircPos: function(deg,r,xo,yo) {
        var y = Math.sin(deg/this.rd), x = Math.cos(deg/this.rd);
        x *= r;
        y *= r;
        x = ((this.radius+this.offset)-x) + xo;
        y = ((this.radius+this.offset)-y) + yo;
        return {x:x,y:y};
    },

    addSegment: function(spanDeg,startDeg,color,index) {
        var r =this.radius, 
            c = r + this.offset,
            d = this.calcSegmentD(spanDeg,startDeg);
        var path = this.snap.path(d).attr({
            "fill": color,
            'class': "segment",
            id: 'house-' + (index+1)
        }),
        tx = r + this.calcArcY(spanDeg),
        ty = this.calcArcX(spanDeg);
        var matrix = new Snap.Matrix();
        matrix.translate(r,0);
        if (startDeg) {
            matrix.rotate(startDeg,0,r);
        }
        path.attr({
            transform: matrix
        });
        var num = index+1;
        if (num < 10) {
            num = '0' + num.toString();
        } else {
            num = num.toString();
        }
        var matrix = new Snap.Matrix();
        
        matrix.rotate(startDeg + (spanDeg/2),c,c);
        matrix.translate(r/24,r/24);
        var sym = this.snap.image('/svgs/signs/glyph/'+num+'.svg',r/24,r,(r/12),(r/12)).attr({
            transform: matrix,
            class: 'house-symbol',
            id: 'house-symbol-'+num 
        });
        this.degreeOverlay.append(sym);
        this.houseSymbols[index] = sym;
        return path;
    },

    tweenSegment: function(spanDeg,startDeg,index) {
        var r = this.radius, c = r + this.offset,
        segment = this.segments[index],
        matrix = new Snap.Matrix();
        //matrix.translate(r,0);
        
        if (startDeg) {
            matrix.rotate(startDeg,c,c);
        }
        if (this.orientation == 'counter') {
            startDeg = 360-startDeg-spanDeg;
        }
        /*segment.attr({
            d: this.calcSegmentD(spanDeg,startDeg)
        });*/
        /*segment.animate({
            transform: matrix
        },500,mina.easein);*/
        if (index < this.houseLines.length) {
            this.houseLines[index].animate({
                transform: matrix
            },500,mina.easin);
        }
        if (index < this.houseLabels.length) {
            var pos = this.calcCircPos((startDeg+spanDeg),r*0.75,-10,10);
            this.houseLabels[index].attr(pos);
        }
    },
    
    addSegments: function() {
        var hb = this.bounds, r = this.radius, c = r+this.offset,
            i=0, seg, spanDeg, startDeg;
        this.segments = [],
        numHouses = hb.length -1;
        for (; i < numHouses;i++) {
            spanDeg = (hb[(i+1)]-hb[i]);
            startDeg = hb[i];
            if (this.orientation == 'counter') {
                startDeg = 360-startDeg-spanDeg;
            }
            seg = this.addSegment(spanDeg,startDeg,this.colors[i%this.colors.length],i);
            this.central.append(seg);
            this.segments.push(seg);    
            var pos = this.calcCircPos((startDeg+spanDeg),(r * 0.75),-10,10);
            var segLbl = this.snap.text(pos.x,pos.y,(i+1).toString()).attr({
                'class': 'house-label'
            });
            var m = new Snap.Matrix();
            m.rotate(startDeg,c,c);
            var ln = this.snap.line(c, 0, c, 750).attr({
                class: "house-line",
                id: 'house-line-' + (i+1),
                transform: m
            });
            this.houseLines.push(ln);
            this.houseLabels.push(segLbl);
        }
    },
    
    tweenSegments: function(newBounds) {
        var valid = false, r = this.radius;
        if (newBounds instanceof Array) {
            if (newBounds.length>1) {
                valid = true;
            }
        }
        if (valid) {
            var m = new Snap.Matrix(),
            startDeg = this.ascendant;
            if (this.orientation == 'counter') {
                startDeg = 360-startDeg;
            }
            m.rotate(startDeg,r+this.offset,r+this.offset);
            m.translate(this.offset,this.offset);
            this.central.animate({
                transform: m
            },500,mina.easein);
            m.translate(0-this.offset,0-this.offset);
            this.lines.animate({
                transform: m
            },500);
            this.degreeOverlay.animate({
                transform: m
            },500);
            this.planetarium.animate({
                transform: m
            },500);
            var numHouses = newBounds.length-1, i=0, hb = [],
                hv, spanDeg, startDeg, endDeg;
            for (;i<(newBounds.length+1);i++) {
                hv = newBounds[i] - newBounds[0];
                if (hv < 0) {
                    hv += 360;
                }
                hb.push(hv);
            }
            this.setBounds(hb);
            for (i=0; i < numHouses;i++) {
                startDeg = hb[i];
                endDeg = hb[(i+1)];
                if (endDeg < startDeg) {
                    endDeg += 360;
                }
                spanDeg = endDeg - startDeg;
                if (i < this.segments.length) {
                    this.tweenSegment(spanDeg,startDeg,i);
                }
            }
        }
        
    },

    placeBody: function(bodyName,lng,pos) {
        var r= this.radius, c = r + this.offset,
            ofs=30,xd = r - ofs, yd = (r * 0.4) - ofs;
        if (this.orientation == 'counter') {
            lng = 360-lng - (360/6);
        }
        var matrix = new Snap.Matrix();
            matrix.rotate(lng,c,c);
        if (this.bodies[bodyName]) {
            if (this.bodies[bodyName].image) {
                this.bodies[bodyName].image.animate({
                    transform: matrix
                },1000);
                this.bodies[bodyName].image.attr({
                    title: bodyName + ': ' + pos
                });
           } else {
            this.bodies[bodyName].image = this.snap.image('/svgs/grahas/glyph/'+bodyName+'-sign.svg',0,0,(r/12),(r/12)).attr({'class':'body ' + bodyName,'id': bodyName + '-sign'});
                this.bodies[bodyName].image.attr({
                    transform: matrix,
                    x: xd,
                    y: yd
                });
           }
           this.planetarium.append(this.bodies[bodyName].image);
            
        }
    },

    tweenBody: function(k,data) {
        if (this.bodies[k]) {
            if (this.bodies[k].image) {
                var yv = (data.lng-180) / 360,
                xv = data.lat / 6;
                this.bodies[k].attr({
                    x: yv,
                    y: xv
                })
            }
        }
    },

    tweenBodies: function(bodies) {
        var r = this.radius;
        if (typeof bodies == 'object') {
            if (bodies.sun) {
                if (typeof bodies.sun == 'object') {
                    var b, xv, yv;
                    for (k in bodies) {
                       b = bodies[k];
                       if (this.bodies[k]) {
                           this.bodies[k].lng = b.lng;
                           this.bodies[k].lat = b.lat;
                           this.bodies[k].ecl = b.ecl;
                           this.placeBody(k, b.lng,b.house);
                       } 
                    }
                }
            }
        }
    },

    placeBodies: function() {
        var b, k;
        for (k in this.bodies) {
            b = this.bodies[k];
            this.placeBody(k,b.lng);
        }
    },

    setBounds: function(bounds) {
        if (bounds instanceof Array) {
            this.bounds = bounds;
        }
    },

    buildIndian: function() {
        this.indian = this.snap.select('#indian');
    },

    /*buildSouthIndian: function() {
        this.southIndian = this.snap.select('#south-indian');
    },*/

    init: function() {
        var r = this.radius, c = r + this.offset;
        this.snap = new Snap('#astro-disc');
        this.central = this.snap.select('#segments');
        this.lines = this.snap.select('#degree-lines');
        this.degreeOverlay = this.snap.select('#degree-overlay');
        this.rd = 180/Math.PI;
        
        this.outer = this.snap.select('circle.outer');
        this.addSegments();
        var i=0, ofs = this.offset, c = r+ofs,dn=r*2, clNames, ln, lbl, len, lc, st;
        for (;i<180;i++) {
            clNames='degree-line';
            if (i%10 == 0) {
                len = dn+(ofs*1.25);
                clNames += ' ten-degrees';
                st = ofs*.75;
            } else if (i%5 == 0) {
                len = dn+ (ofs * 1.128);
                clNames += ' five-degrees';
                st = ofs * .872;
            } else {
                len = dn + (ofs*1.12);
                clNames += ' one-degree';
                st = ofs * .88;
            }
            ln = this.snap.line(c, st, c, len).attr({
                class: clNames,
                transform: "rotate("+i+"deg)"
            });
            this.degreeLines[i] = ln;
            this.lines.append(ln);
            if (i%30 == 0) {
                var pos = this.calcCircPos((360-i),(this.radius + (this.offset/2)),-5,5),
                lbl = this.snap.text(pos.x, pos.y, i.toString()).attr({
                    class: 'degree-label'
                });
                this.degreeOverlay.append(lbl);
                pos = this.calcCircPos((180-i),(this.radius + (this.offset/2)),-5,5);
                lbl = this.snap.text(pos.x, pos.y, i.toString()).attr({
                    class: 'degree-label'
                });
                this.degreeOverlay.append(lbl);
            }

        }
        this.topCircles = this.snap.select('#top-circles');

        this.inner = this.snap.select('circle.inner');
        
        this.bodies = {
            sun: { lng: 72, lat: -0.0015, ecl: 0.9472557500000001, house: 10.668 },
            moon: { lng: 250, lat: 3.353, ecl: 17.1252025, house: 4.640 },
            mercury: { lng: 78, lat: -4.413, ecl: -0.5935002500000001, house: 10.620 },
            venus: { lng: 29, lat: -2.997, ecl: 0.9983701111111111, house: 9.140 },
            mars: { lng: 127, lat: 1.143, ecl: 0.5873172222222223, house: 12.3343 },
            jupiter: { lng: 283, lat: -0.540, ecl: -0.09629297222222222, house: 5.574 },
            saturn: { lng: 276, lat: -0.123, ecl: -0.06542327777777779, house: 5.342 },
            uranus: { lng: 121, lat: 0.707, ecl: 0.04723602777777778, house: 12.1301 },
            neptune: { lng: 196, lat: 1.806, ecl: -0.011241, house: 2.699 },
            pluto: { lng: 134, lat: 12.669, ecl: 0.020179944444444445, house: 12.531 },
        };
        this.planetarium = this.snap.select('#planetarium');

        this.placeBodies();
    }
};