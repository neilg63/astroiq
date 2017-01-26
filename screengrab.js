var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1920 };
page.open('http://127.0.0.1:9862/chart', function() {
  page.render('screengrab.pdf');
  phantom.exit();
});