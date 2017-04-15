var MessageHandler = require('./MessageHandler.js');

function SkyChat()
{
  this.messageHandler = new MessageHandler(this);
  this.userList = {};
	this.messageBuffer = [];
	this.lastMessage = '!';
	this.current_room = -1;
}

SkyChat.prototype.checkMessageBuffer = function()
{
	if(this.messageBuffer.length > 0) {
		this.lastMessage = this.messageBuffer.shift();
		this.sock.emit('message', { message: this.lastMessage });
	}
};

SkyChat.prototype.init = function(config)
{
	// If the SkyChat object has already been initialized
	if(typeof this.config !== 'undefined') {
		// Return current SkyChat object
		return this;
	}

	this.config = config;
	this.eventLoop = require('./EventLoop.js');
	this.getLoginToken(this.initSock.bind(this));

	return this;
};

SkyChat.prototype.initSock = function() {
	this.sock = require('socket.io-client').connect('http://skychat.fr:8056');
	this.eventLoop.initSock(this.sock);
	this.eventLoop.on('connect', this.handleConnect.bind(this));
}

SkyChat.prototype.fire = function (name, args) {
  this.eventLoop.fire(name, args);
};

SkyChat.prototype.format = function (msg) {
  return this.messageHandler.format(msg);
};

/**
 * Obtient le token de login depuis l'API skychat.fr
 * Appelle callback().
 * En cas d'erreur : pas d'appel au callback.
 */
SkyChat.prototype.getLoginToken = function(callback) {
	var request = require('request');
	request.post({
		url: 'http://skychat.fr/ajax/account/api2.php',
		form: {
			pseudo: this.config.username,
			pass: this.config.password
		}
	}, (function(err, res, body) {
		if(err) return console.log(err);
		this.credentials = JSON.parse(body);
		callback();
	}).bind(this));
};

SkyChat.prototype.handleConnect = function () {
	this.sock.emit('log', this.credentials);
	this.send('/join 0');
	this.handleLogin(this.credentials);
};

SkyChat.prototype.handleConnectedList = function (list) {
  this.userList = list;
};

SkyChat.prototype.handleLogin = function (log) {
	this.pseudo = log.pseudo;
  this.fire('log', log);
  this.fire('log_once', log);
  this.on('alert', this.handleServerInfo.bind(this));
	this.on('error', this.handleServerInfo.bind(this));
  this.on('info', this.handleServerInfo.bind(this));
  this.on('success', this.handleServerInfo.bind(this));
  this.on('connected_list', this.handleConnectedList.bind(this));
	this.on('pseudo_info', this.handlePseudoInfo.bind(this));
	this.on('room_list', (data) => {
		for(var i in data) {
			if(data[i].id == this.current_room) {
				this.fire('room_name', data[i].name);
				break;
			}
		}
	});
  setTimeout((function () {
    this.on('message', this.messageHandler.handle.bind(this.messageHandler));
  }).bind(this), 1000);
	setInterval(this.checkMessageBuffer.bind(this), 400);
};

SkyChat.prototype.handlePseudoInfo = function(data) {
	if(this.current_room != data.current_room) {
		this.current_room = data.current_room;
		this.send('/roomlist');
	}
};

SkyChat.prototype.handleServerInfo = function (msg) {
  if(typeof msg.message === 'undefined') return;
  this.eventLoop.fire('server_info', msg);
  var match = msg.message.match(/attendre (.*?) millis/);
	if(match && match.length == 2 && typeof this.lastMessage !== 'undefined') {
		this.messageBuffer.unshift(this.lastMessage);
	}
};

SkyChat.prototype.mp = function (user, str) {
	this.send('/mp ' + user + ' ' + str);
};

SkyChat.prototype.on = function (name, callback) {
  this.eventLoop.on(name, callback);
};

SkyChat.prototype.send = function(message) {
	this.messageBuffer.push(message);
};

SkyChat.prototype.sendLater = function(msg, delay) {
	if(typeof delay === 'undefined') delay = 1000;
	setTimeout((function() { this.send(msg); }).bind(this), delay);
};

module.exports = new SkyChat();
