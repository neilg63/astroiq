Math.approx = function(num,places) {
  var p = Math.pow(10,places);
  return Math.round(num * p) / p;
}

String.prototype.ltrim = function() {
  return this.replace(/^\s+/,'');
}

String.prototype.rtrim = function() {
  return this.replace(/\s+$/,'');
}
  
String.prototype.trim = function() {
  return this.ltrim().rtrim();
}

String.prototype.despace = function() {
  return this.trim().replace(/\s+/g,' ');
}

String.prototype.textLength = function(mode) {
  var txt = this.despace();
  switch (mode) {
    case 'alpha':
      txt = txt.replace(/[^a-z]/gi,'');
      break;
    case 'alphanum':
      txt = txt.replace(/[^a-z0-9]/gi,'');
      break;  
  }
  return txt.length;
}


String.prototype._contains = function(type,str,mode) {
  var rgx, source;
  if (str.constructor == RegExp) {
    switch (mode) {
    case 'word': case 'f': case 'fuzzy': case 'smart': case 'regex':
      default:
        mode = 'f';
        break;
    }
    var ar = str.toString().split('/');
    str = ar.length>0? ar[1] : '';
  }
  if (typeof str != 'string') {
    str = '';
  }
  switch (mode) {
    case 'i':
    case 't': case 'trim': case 'ti':
      switch (mode) {
        case 'i': case 'ti':
          source = this.toLowerCase();
          str = str.toLowerCase();
          break;
        default:
          source = this;
          break;
      }
      switch (mode) {
        case 't': case 'ti': case 'trim':
          source = source.trim();
          break;
      }
      break;
    case 'f': case 'fuzzy': case 'smart': case 'regex': case 'word':
      var b = mode=='word'? '\\b' : '';
      switch (type) {
        case 'start':
          rgx = '^' + str + b;
          break;
        case 'end':
          rgx = b + str + '$';
          break;
        default:
          rgx = b + str + b;
          break;
      }
      return new RegExp(rgx,'i').test(this);
      break;  
    default:
      source = this;
      break;
  }
  var index = source.indexOf(str);
  switch (type) {
    case 'start':
      return  index == 0;
    case 'end':
      return  index == (this.length - str.length);  
    default:
      return index >= 0;
  }
  return false;
}

String.prototype.startsWith = function(str,mode) {
  return this._contains('start',str,mode);
}

String.prototype.endsWith = function(str,mode) {
  return this._contains('end',str,mode);
}

String.prototype.contains = function(str,mode) {
  return this._contains('contain',str,mode);
}

String.prototype.first = function(separator) {
  return this.split(separator).shift();
}

String.prototype.last = function(separator) {
  return this.split(separator).pop();
}

String.prototype.tailHead = function(separator,mode) {
  var parts = this.split(separator), rest = '';
  if (mode == 'tail') {
    parts.shift();
  } else {
    parts.pop();
  }
  if (parts.length>0) {
    rest = parts.join(separator);
  }
  return rest;
}

String.prototype.tail = function(separator) {
  return this.tailHead('tail');
}

String.prototype.head = function(separator) {
  return this.tailHead('head');
}

String.prototype.segment = function(index,separator) {
  var parts = this.split(separator),segment = '';
  if (parts.length > index) {
    segment = parts[index]
  }
  return segment;
}

String.prototype.sanitize = function(separator) {
  return this.toLowerCase().replace(/[^0-9a-z]+/i,'').replace(/[^0-9a-z]+$/i,'').replace(/[^0-9a-z]+/gi,separator);
}

String.prototype.numberStrings = function() {
  return this.replace(/[^0-9.-]+/g,' ').trim().split(' ');
}

String.prototype.toNumberString = function() {
  return this.numberStrings().shift();
}

String.prototype.endNumber = function() {
  var n = -1, ns = this.numberStrings();
  if (ns.length>0) {
    n = ns.pop() - 0;
  }
  return n;
}

String.prototype.isNumeric = function(allowCommas) {
  var rgx = new RegExp('^\\s*-?\\d+(\\.\\d+)?\\s*$');
  return rgx.test(this);
}

function isNumeric(scalarVal) {
  switch (typeof scalarVal) {
    case 'number':
      return !isNaN(scalarVal);
    case 'string':
    return scalarVal.isNumeric();
  }
}

String.prototype.endInt = function() {
  return Math.abs(parseInt(this.endNumber()));
}


String.prototype.toInt = function() {
  var n = this.toNumberString();
  if ( !isNaN(n) ) {
    return parseInt(n);
  }
  return 0;
}

String.prototype.toFloat = function() {
  var n = this.toNumberString();
  if (!isNaN(n)) {
    return parseFloat(n);
  }
  return 0;
}
/*
Language-sensitive text utils library
*/
var TextUtils = {
  filterSmallWords: function(word) {
    switch (word.toLowerCase()) {
      case 'to':
      case 'the':
      case 'that':
      case 'those': 
      case 'this':  
      case 'these': 
      case 'in':
      case 'on':
      case 'upon':
      case 'over':
      case 'above': 
      case 'among': 
      case 'between':   
      case 'about': 
      case 'at':
      case 'of':
      case 'in':
      case 'for': 
      case 'and':
      case 'a':
      case 'an':
      case 'from':
      case 'with':
      case 'against':
        return false;
      default:
        return true;
    }
  }
}

/*
Capitalize irrespective of word or apply filter
*/
String.prototype.capitalize = function(smart) {
  var parts = this.split(/\b/), text = '',
    num = parts.length,word,wordLen = 0, cast = true;
  smart = smart? true : false;
  if (num > 0) {
    for (k in parts) {
      word = parts[k];
      wordLen = word.length;
      if (wordLen>0) {
        cast = (k > 0 && smart)? TextUtils.filterSmallWords(word) : true;
        if (cast) {
          text += word.substring(0,1).toUpperCase();
          if (word.length > 1) {
            text += word.substring(1,wordLen);
          }
        } else {
          text += word;
        }
      }
    }
  }
  return text;
}

String.prototype.titleCase = function(smart) {
  return this.capitalize(true);
}

/*
Clean strings that will be translated to Unix commands to avoid
writing to files, appending or piping other commands
*/
String.prototype.cleanCommand = function() {
  return this.split("|").shift().split(">").shift().split('&').shift().split("<").shift();
}

/*
Simply Word object
*/
var Word = function(str) {
  this.letters = str.split('');
}

Word.prototype.length = function() {
  return this.letters.length;
}

Word.prototype.get = function(index) {
  var letter = '';
  if (index < this.letters.length) {
    letter = this.letters[index];
  }
  return letter;
}

Word.prototype.size = function() {
  return this.letters.length;
}

Word.prototype.append = function(str) {
  if (str) {
    var letters = str.split('');
    for (l in letters) {
      this.letters.push(letters[l]);
    }
  }
  return this;
}

Word.prototype.toString = function() {
  return this.letters.join('');
}

function convertDDToDMS(D, lng){
  return {
    dir : D<0?lng?'W':'S':lng?'E':'N',
    deg : 0|(D<0?D=-D:D),
    min : 0|D%1*60,
    sec :(0|D*60%1*6000)/100
  };
}

function toLatitudeString(decLat) {
  return _toLatLngString(decLat,'lat');
}

function toLongitudeString(decLng) {
  return _toLatLngString(decLng,'lng');
}

function _toLatLngString(dec,degType) {
  if (isNumeric(dec)) {
    dec = parseFloat(dec);
    var isLng = false,max=90;
    switch (degType) {
      case 'lng':
      case 'long':
      case 'longitude':
        isLng = true;
        max = 180;
        break;
    }
    var min = 0-max;
    if (dec >= max) {
      dec -= (max*2);
    } else if (dec <= min) {
      dec += (max*2);
    }
    var degree = convertDDToDMS(dec,isLng);
    return degree.deg + '&deg; ' + degree.min + '&apos; ' + degree.sec + '&quot; ' + degree.dir;
  } 
}

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