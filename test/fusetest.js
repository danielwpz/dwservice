var service = require('../index.js');

var test = service('./interface.json');

setInterval(function() {
	test.getAll(null, null, function(err, res, body) {
		if (!! err) {
			console.log('ERROR', err);
		}else {
			console.log('body', body);
		}
	});
}, 1000);
