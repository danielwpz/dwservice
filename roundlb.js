/**
 * roundlb.js
 *
 * Daniel Wang
 * Apr 2016
 */

function lb(hosts) {
	this.hosts = hosts;
	this.index = 0;
}

lb.prototype.pickNext = function() {
	this.index++;

	var i = this.index % this.hosts.length;

	return this.hosts[i];
}

lb.prototype.getHosts = function() {
	return this.hosts;
}

module.exports = lb;
