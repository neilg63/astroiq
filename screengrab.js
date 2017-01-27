var system = require('system');
var args = system.args;
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1920 };
page.open('http://127.0.0.1:8000/chart/' + id, function() {
  page.render('screengrab-'+id+'.pdf');
  phantom.exit();
});