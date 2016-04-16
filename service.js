/**
 * service.js
 *
 * Daniel Wang
 * Apr 2016
 */

var fs = require('fs');
var exp = require("express");
var bodyParser = require("body-parser");
var logger = require('./logger.js');
var log = new logger('Daniel', 'service.js');
var fusewire = require('./fusewire.js');

var default_lb = require('./roundlb.js');

/**** Consume ****/

/*
 *  * For incomplete urls, such like '/item/:id',
 *   * fill the url with parameters in p
 *    */
function parseURL(url, p) {
	var result = "";
	var items = url.split('/');
	var i;

	for (i = 1; i < items.length; i++) {
		var item = items[i];

		if (item.indexOf(':') == 0) {
			var keyname = item.substring(1);
			var val = p[keyname];

			if (!! val) {
				result = result + '/' + val;
			}else {
				log.error('Invalid params:' + JSON.stringify(p) + ' for url: ' + url);
				result = null;
				break;
			}
		}else {
			result = result + '/' + item;
		}
	}

	return result;
}

function buildHandler(inface, i, lb, keys) {
	// wrap of send request and handle error
	var send = function (param, body, cb, cnt) {
		// parse params and url
		var method = inface.services[keys[i]][0];
		var host = lb.pickNext();
		var path = inface.services[keys[i]][1];
		var url = host + parseURL(path, param);

		// fusewire
		if (! inface.fuses[url]) {
			inface.fuses[url] = new fusewire();
		}
		var fuse = inface.fuses[url];

		// if the current status is halfopen,
		// we refuse any requests
		if (fuse.getStatus() == fusewire.STATUS_HALFOPEN) {
			var err = new Error('EFUSEWIRE');

			cb(err, null, null);
			return;
		}

		// if the current status is break,
		// only the first request after breaktime could be sent
		if (fuse.getStatus() == fusewire.STATUS_BREAK) {
			var t = (new Date()).getTime();

			if (t - fuse.getBreakpoint() > fuse.getBreaktime()) {
				fuse.setToHalfopen();
				log.debug('fusewire ' + url + ' set to HALFOPEN');
			}else {
				var err = new Error('EFUSEWIRE'); 

				cb(err, null, null);
				return;
			}
		}

		// send the request
		inface._request({
			method: method,
			uri: url,
			json: body,
			timeout: fuse.getTimeout()
		},
		function (err, res, body) {
			if (!! err) {
				log.error("Request " + url + " : " + err);
				fuse.increaseFailure();

				if (cnt > 0) {
					// try another host
					log.debug('Try another host for ' + url);
					send(param, body, cb, cnt - 1);
				}else {
					// all host unavailable
					cb(err, res, body);
				}
			}else {
				fuse.reset();
				cb(err, res, body);
			}
		});
	};

	// corresponding method of 'inface',
	// called by the user
	var f = function (param, body, cb) {
		var max_try = lb.getHosts().length;
		send(param, body, cb, max_try);
	}


	return f;
}

/**** Definition ****/

function setExpressRoute (app, method, url, handler) {

	var fun = app[method];

	if (! fun) {
		log.error('setExpressRoute error');
		return;
	}

	fun.call(app, url, function (req, res, next) {
		log.debug(req.method + ' ' + req.url);

		handler(req, res);
		next();
	});
}

var doStart = function(obj) {
	/**
	 * port: port number at which service listens
	 * cb: callback function when service started
	 * options: currently only for HTTPS settings
	 */
	var f =  function(port, cb, options) {
		var name = obj.name;
		inface = obj;
		imple = obj._imple;

		var app = exp();
		var http = require('http');
		var https = require('https');
		app.use(bodyParser.json());
		var sers = inface.services;
		var serKeys = Object.keys(sers);

		// bind all handlers to express server
		var i;
		for (i = 0; i < serKeys.length; i++) {
			var key = serKeys[i];

			var method = sers[key][0];
			var url = sers[key][1];
			var handler = imple[key];

			setExpressRoute(app, method, url, handler);
		}

		// HTTP or HTTPS
		var server;
		if (!!options && !!options.key && !!options.cert) {
			var httpsOpt = {
				key: options.key,
				cert: options.cert
			};

			server = https.createServer(httpsOpt, app);
		}else {
			server = http.createServer(app);
		}

		server.listen(port, function() {
			obj._expressServer = app;

			log.info("Service [" + name + "] is running on port " + port);
			if (!! cb) {
				cb();
			}
		});
	}

	return f;
}

/**
 * infaceJSON: string path to a json file
 */
function Service(infaceJSON, options) {
	var file = fs.readFileSync(infaceJSON, 'utf8');
	file = file.replace(/(\r\n|\n|\r|\t)/gm, '');
	var obj = JSON.parse(file);

	if (! obj) {
		log.error('Could not parse JSON: ' + infaceJSON);
		return null;
	}else {

		// add consuming functions
		obj._request = require('request');
		var keys = Object.keys(obj.services);

		// server picker
		if (!!options && !!options.lb) {
			obj._lb = options.lb;
		}else {
			obj._lb = new default_lb(obj.hosts);
		}

		// add fusewire list
		obj.fuses = {};

		var i;
		for (i = 0; i < keys.length; i++) {
			obj[keys[i]] = buildHandler(obj, i, obj._lb, keys); 
		}


		// add bind function
		obj.bind = function (imple) {
			obj._imple = imple;
		}

		// add start function
		obj.start = doStart(obj);
	}

	return obj;
}



module.exports = Service;
