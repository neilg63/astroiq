var AstroChart = {

    diameter: 1500,

    mainOffset: 0,

    houses: [
        0,
        30,
        60,
        90,
        120,
        150,
        180,
        210,
        240,
        270,
        300,
        330
    ],

  westernLayer: null,

  northIndianLayer: null,

  southIndianLayer: null,  

    houseLayer: null,

    houseLines: [],

    houseLabels: [],

  signGlyphs: [],

    segments: [],

    segmentColors: [
        '#aa3300',
        '#00aa33',
        '#229944',
        '#448800',
        '#009966',
        '#990099',
        '#779922',
        '#3366cc',
        '#66cc66',
        '#cc0099',
        '#444499',
        '#3300cc'
    ],

    svg: null,

    inner: null,

    main: null,

    degreeLayer: null,

  degreeLabels: null,

  discLayer: null,

  labelLayer: null,

    _xyPos: function(deg,pad,x,y) {
    if (!pad) {
      pad = 0;
    }
    if (!x) {
        x = 0;
    }
    if (!y) {
        y=0;
    }
    var d = this.diameter,r = (d/2)-pad;
    return {
      x: ( (Math.sinDeg(deg) * r) + r) + pad + x,
      y: Math.abs(0 - (Math.cosDeg(deg) * r) + r + pad) + y
    };
  },

    buildDegrees: function() {
        this.degreeLayer = d3.select('g.degrees');
        this.degreeLabels = d3.selectAll('text.degree-label');
    },

    _segmentPathCoords: function(radius,deg,inset) {
        var cos = Math.cosDeg(30),
            sin=Math.sinDeg(30),
            y = radius + inset,
        s2 = radius - (cos * radius) + inset;
        s1 = radius + (sin * radius) + inset;
        return 'M'+y+','+inset+' A'+radius+','+radius+' 0 0,1 '+s1+','+s2+' L'+y+','+y+' Z';
    },

    buildMain: function() {
        this.signGlyphs = [];
    this.discLayer = d3.select('g.main-segments');
    this.labelLayer = d3.select('g.segment-symbols');
        this.segments = d3.selectAll('g.segments');
        this.signGlyphs = d3.selectAll('image.segment-symbol');
    
    },

    buildInner: function() {
        this.inner = d3.select('g.inner-disc');
    },

  tweenDegreeLabels: function(deg) {
    AstroChart.degreeLabels.attr('transform',function(){
      var it = d3.select(this), x = it.attr('x'), y = it.attr('y');
      return 'rotate('+(0-deg)+','+x+','+y+')';
    });
    //AstroChart.signGlyphs.attr('transform','rotate('+(0-deg)+','+x+','+y+')');
    AstroChart.signGlyphs.attr('transform',function(){
      var it = d3.select(this), x = it.attr('x'), y = it.attr('y');
      //var off = 0- Math.abs((0-deg)%90) / 6;

      return 'rotate('+(0-deg)+','+x+','+y+')';
    });
  },

  tweenMain: function(deg) {
    AstroChart.mainOffset = deg;
    AstroChart.tweenDegreeLabels(deg);
    AstroChart.main.transition()
            .duration(2000)
            .attrTween("transform", function() {
          var i = d3.interpolate(0, AstroChart.mainOffset);
          return function(t) {
              return "rotate(" + i(t) + ","+AstroChart.radius+","+AstroChart.radius+")";
          };
      });

  },

  tweenHouses: function(newHouses) {
    var numNewHouses = newHouses.length;
    for (var i=0;i<numNewHouses;i++) {
      deg = 270-newHouses[i];
      this.houseLines[i].attr('data-next-deg',deg).transition()
      .delay(1500)
      .duration(1000)
      .attrTween('transform',function(){
        var it = d3.select(this),
          oldDeg = it.attr('data-deg'),
          nextDeg = it.attr('data-next-deg');
          it.attr('data-deg',nextDeg);
          var inter = d3.interpolate(oldDeg, nextDeg);
          return function(t) {
              return "rotate(" + inter(t) + ",750,750)";
          };
      });
      this.houseLabels[i]
        .attr('data-next-deg',deg)
        .classed('invisible',true)
      .transition()
      .delay(2250)
      .attrTween('transform',function(){
        var it = d3.select(this),
          oldDeg = it.attr('data-deg'),
          nextDeg = it.attr('data-next-deg');
          var pos = AstroChart._xyPos((nextDeg-5),40,-36,-40);
          it.classed('invisible',false);
          return function(t) {
              return 'translate('+pos.x+','+pos.y+')';
          };
      });
    }
  },

  buildHouses: function() {
    this.houseLayer = d3.select('g.house-lines-group');
    this.houseLines = [];
    this.houseLabels = [];
    var numHouses = this.houses.length,
      colors = ['#550000','#005500','#000055'],
      pos, cls,deg, lbl, cg, cc;
    for (var i=0;i<numHouses;i++) {
      color = colors[(i%colors.length)];
      cls = 'house-line house-line-' + (i+1);
      if (i===0) {
        cls += ' ascendant';
        this.houseLayer.append('polyline')
          .attr('points','20,730 0,750 20,770')
          .attr('class','ascendant')
          .attr('fill','none')
          .attr('stroke','red')
          .attr('stroke-width',3)
      }
      if (i < (numHouses/2)) {
        deg = this.houses[i];
      } else {
        deg = 180 + this.houses[(i-(numHouses/2))];
        this.houses[i] = deg;
      }
      deg = 270-deg;
      this.houseLines[i] = this.houseLayer.append('line')
        .attr('class',cls)
        .attr('data-deg',deg)
        .attr('x1',750)
        .attr('y1',0)
        .attr('x2',750)
        .attr('y2',750)
        .attr('stroke',color)
        .attr('stroke-width',3)
        .attr('transform','rotate('+deg+',750,750)');
        
        
      pos = this._xyPos((deg-5),40,-36,-40);
      cg = this.houseLayer.append('g')
      .attr('data-deg',deg)
      .attr('class','house-label house-label-' + (i+1))
      .attr('transform','translate('+pos.x+','+pos.y+')');
      cc = cg.append('circle')
      .attr('cx',40)
      .attr('cy',40)
      .attr('r',40)
      .attr('fill','white');
      
      lbl = cg.append('text')
      .text((i+1))
      .attr('x',20)
      .attr('y',50);
      this.houseLabels[i] = cg;
    }
  },

  updateHouses: function(newHouses) {
    if (newHouses instanceof Array === false) {
       newHouses = _.flatMap(newHouses);
    }
    var ascendant = newHouses[0];
    AstroChart.tweenMain(ascendant);
    for (var i=0;i<newHouses.length;i++) {
      newHouses[i] -= ascendant;
    }
    AstroChart.tweenHouses(newHouses);
  },

  addDiscDrag: function() {
    function xyDeg(diam,x,y,offset) {
      if (typeof offset !== 'number') {
        offset = 0;
      }
      var r = (diam/2) - offset;
      var x2 = ((x-offset) / r) -1, y2 = 2- ((y-offset) / r) -1,
       deg1 = Math.asinDeg(x2), deg2 =Math.acosDeg(y2);
       if (deg1 < 0) {
         deg2 = 360 - deg2;
       }
      return deg2;
    }

    function move(){
      //this.parentNode.appendChild(this);
      var dt = d3.select(this),newDeg=0,tr = dt.attr('transform');
      if (tr != undefined) {
        newDeg = tr.split('(').pop().split(',').shift()-0;
      }
      
      
      var pDeg = dt.attr('data-drag');
      if (!pDeg) {
        pDeg = 0;
      } else {
        pDeg = pDeg-0;
      }
      var cDeg = xyDeg(1500,d3.event.x,d3.event.y,150),
      dDeg = cDeg-pDeg;
      if (cDeg > pDeg || dDeg < -30) {
        newDeg += 0.5;
      } else {
        newDeg -= 0.5;
      }
      if (Math.abs(dDeg) > 0.2) {
        if (newDeg >= 360) {
          newDeg -= 360;
        }
        AstroChart.tweenDegreeLabels(newDeg);
        if (!isNaN(cDeg)) {
          dt.attr('data-drag',cDeg);
          dt.attr("transform",'rotate('+newDeg+',750,750)');
        }
      }
      
    };

    this.main.call(d3.drag()
        .on("start", function(d, i){
          //console.log(d3.event.dx)
        })
        .on("drag", move)
        .on("end", function(d, i){
          //console.log(d3.event.dx,d3.event.dy)
        })
    );
  },

    init: function() {
        this.radius = this.diameter/2;
        this.svg = d3.select('#svg')
            .attr('width',this.diameter)
            .attr('height',this.diameter)
            .attr('viewBox','0 0 '+this.diameter+' '+this.diameter);
    this.westernLayer = d3.select("#western-chart");
    this.main = d3.select('.main-disc');

    this.degreeLabels = [];
        this.buildDegrees();
        this.buildMain();
        this.buildInner();
        this.buildHouses();

    
        /*this.main.on('click',function(){
            
            newHouses = [
                98,
                113,
                156,
                181,
                207,
                244,
                278,
                303,
                336,
                1,
                27,
                64
            ];
            AstroChart.updateHouses(newHouses);
        });*/

    }

}