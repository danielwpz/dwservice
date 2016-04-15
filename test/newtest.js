var service = require('../index.js');
var imple = require('./test_implementation.js');

var test = service('./interface.json');

test.bind(imple);

test.start(8080, function() {
	test.getAll(null, null, function (err, res, body) {
		console.log('getAll result body: ' + body);
	});

	test.getName({id: 'wang'}, null, function(err, res, body) {
		console.log('getName(wang) get result:' + body);
	});

	test.addName({id: 'wang'}, {name: 'dan'}, function(err, res, body) {
		console.log('addName(wang, daniel) get result:' + body);

		test.getName({id: 'wang'}, null, function(err, res, body) {
			console.log('getName(wang) get result:' + body);
		});

		test.addName(
			{id: 'huang'}, 
			{name: 'kelly'}, 
			function (err, res, body) {
				test.getAll(null, null, function(e, res, body) {
					console.log('getAll result body: ' + body);
				});
			}
			);

	});
});

// test
var request = require('request');

request({
	uri: 'http://localhost:9000',
	timeout: 3000
}, function(err, res, body) {
	console.log('err:' + err.code);
	console.log('res:' + res);
	console.log('body:' + body);
});
