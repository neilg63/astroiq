var mongoose = require('mongoose');
if (!process.env.MONGODB_URI) {
	process.env.MONGODB_URI = '127.0.0.1:27017';
}
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};
