var ds = require("../index.js");
var Logger = require('../logger.js');
var log = new Logger('Daniel', 'imple.js');

var test = {};
var names = {};

test.getName = function(req, res) {
	var para = req.params;

	if (!! names[para.id]) {
		res.json(names[para.id]);
	}else {
		res.sendStatus(404).end();
	}
}

test.getAll = function(req, res) {
	res.json(names);
}

test.addName = function(req, res) {
	var para = req.params;
	var body = req.body;

	names[para.id] = body.name;
	res.sendStatus(201).end();
}

module.exports = test;
