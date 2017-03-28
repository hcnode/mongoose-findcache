var mockgoose = require('mockgoose');
var mongoose = require('mongoose');
/* global before after */
before(function(done) {
	mockgoose(mongoose).then(function() {
		mongoose.connect('mongodb://localhost/findCache-plugin', function(err) {
			done(err);
		}); 
	});
});
after(function(done) {
	done();
});