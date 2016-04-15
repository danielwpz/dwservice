/**
 * fusewire.js
 *
 * Daniel Wang
 * Apr 2016
 */

var logger = require('./logger.js');
var log = new logger('Daniel', 'fusewire');

function fusewire(timeout, retrytimes, breaktime) {
	this.timeout = timeout || fusewire.DEFAULT_TIMEOUT;
	this.retrytimes = retrytimes || fusewire.DEFAULT_RETRYTIMES;
	this.breaktime = breaktime || fusewire.DEFAULT_BREAKTIME;

	this.failcnt = 0;
	this.status = fusewire.STATUS_OPEN;
}

module.exports = fusewire;

fusewire.DEFAULT_TIMEOUT = 5000;	// 3s
fusewire.DEFAULT_RETRYTIMES = 3;
fusewire.DEFAULT_BREAKTIME = 2 * fusewire.DEFAULT_TIMEOUT;

fusewire.STATUS_OPEN = 0;
fusewire.STATUS_BREAK = 1;
fusewire.STATUS_HALFOPEN = 2;


fusewire.prototype.increaseFailure = function() {
	this.failcnt++;

	if (this.failcnt >= this.retrytimes) {
		this.status = fusewire.STATUS_BREAK;
		this.breakpoint = (new Date()).getTime();
		log.debug('Set to BREAK');
	}
}

fusewire.prototype.getTimeout = function() {
	return this.timeout;
}

fusewire.prototype.getStatus = function() {
	return this.status;
}

fusewire.prototype.getBreaktime = function() {
	return this.breaktime;
}

fusewire.prototype.getBreakpoint = function() {
	return this.breakpoint;
}

fusewire.prototype.setToHalfopen = function() {
	this.status = fusewire.STATUS_HALFOPEN;
}

fusewire.prototype.reset = function() {
	this.status = fusewire.STATUS_OPEN;
	this.failcnt = 0;
	this.breakpoint = null;
}
