var system = require('system');
var args = system.args;
if (args.length > 1) {
	var page = require('webpage').create(), id = args[1];
	page.viewportSize = { width: 1920, height: 1920 };
	page.open('http://127.0.0.1:9862/chart?id='+id, function() {
	  window.setTimeout(function () {
	  	page.render('screengrab-'+id+'.pdf');
	  	phantom.exit();
	  },2000);
	});
}
