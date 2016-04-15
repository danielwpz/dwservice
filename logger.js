/**
 * logger.js
 *
 * Created by Daniel Wang
 * Sep 2015
 */
var colors = require('colors/safe');

function Logger(tip, title) {
	this.tip = tip;
	this.title = title;
	addSpeaker(Logger.speakers, tip);
	addSpeaker(Logger.allSpeakers, tip);
}

Logger.LOG_LEVEL = {
	ALL: 12,
	DEBUG: 8,
	LOG: 4,
	INFO: 4,
	ERROR: 1,
	MUTE: 0
}

Logger.speakers = new Array();
Logger.allSpeakers = new Array();
Logger.logLevel = Logger.LOG_LEVEL.ALL;

function addSpeaker(list, name) {
	var i;
	var exist = false;

	for (i = 0; i < list.length; i++) {
		if (list[i] == name) {
			exist = true;
		}
	}

	if (! exist) {
		list.push(name);
	}
}


Logger.isBelowCurrentLevel = function(l) {
	return l <= Logger.logLevel;
}


Logger.couldSpeak = function(tip) {
	var i;
	for (i = 0; i < Logger.speakers.length; i++) {
		if (Logger.speakers[i] == tip) {
			return true;
		}
	}

	return false;
}

Logger.prototype.print = function(s) {
	var speakerName = '';
	if (Logger.speakers.length > 1) {
		speakerName = '[' + this.tip + '] ';
	}

	console.log(speakerName + this.title + ':' + s);
}

Logger.prototype.speak = function(s) {
	if (Logger.couldSpeak(this.tip)) {
		this.print(s);
	}
}

/**
 * Public interfaces for Logger
 */

Logger.prototype.debug = function(s) {
	if (Logger.isBelowCurrentLevel(Logger.LOG_LEVEL.DEBUG)) {
		this.speak(colors.green(' <DEBUG> ' + s));
	}
}

Logger.prototype.log = function(s) {
	if (Logger.isBelowCurrentLevel(Logger.LOG_LEVEL.LOG)) {
		this.speak(s);
	}
}

Logger.prototype.info = function(s) {
	if (Logger.isBelowCurrentLevel(Logger.LOG_LEVEL.INFO)) {
		this.speak(colors.grey(' <INFO> ' + s));
	}
}

Logger.prototype.error = function(s) {
	if (Logger.isBelowCurrentLevel(Logger.LOG_LEVEL.ERROR)) {
		this.speak(colors.red(' <ERROR> ' + s));
	}
}


Logger.prototype.muteAll = function() {
	Logger.speakers = [];
}

Logger.prototype.muteOthers = function() {
	Logger.speakers = [this.tip];
}

Logger.prototype.showAll = function() {
	Logger.speakers = Logger.allSpeakers;
}

Logger.prototype.show = function(a) {
	Logger.speakers = a;
}

Logger.prototype.setLogLevel = function(lvl) {
	Logger.logLevel = lvl;
}

module.exports = Logger;
