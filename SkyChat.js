var MessageHandler = require('./MessageHandler.js');

// - config = {
//   username: '',
//   password: ''
// }
function SkyChat()
{
  this.messageHandler = new MessageHandler(this);
  this.userList = {};
	this.messageBuffer = [];
	this.lastMessage = '!';
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
	this.sock = require('socket.io-client').connect('http://skychat.fr:8056');
  this.eventLoop.initSock(this.sock);
  this.eventLoop.on('connect', this.handleConnect.bind(this));

	return this;
};

SkyChat.prototype.fire = function (name, args) {
  this.eventLoop.fire(name, args);
};

SkyChat.prototype.format = function (msg) {
  return this.messageHandler.format(msg);
};

SkyChat.prototype.handleConnect = function () {
  function login(err, res, body) {
    if(err) return console.log(err);
    body = JSON.parse(body);
    this.sock.emit('log', body);
    this.send('/join 0');
    this.handleLogin(body);
  }
  if(this.config.password === '') throw 'Password is "" ! Stopping.';
  require('request').post({
    url: 'http://skychat.fr/ajax/account/api2.php',
    form: {
      pseudo: this.config.username,
      pass: this.config.password
    }
  }, login.bind(this));
};

SkyChat.prototype.handleConnectedList = function (list) {
  this.userList = list;
};

SkyChat.prototype.handleLogin = function (log) {
  this.fire('log', log);
  this.fire('log_once', log);
  this.on('alert', this.handleServerInfo.bind(this));
	this.on('error', this.handleServerInfo.bind(this));
  this.on('info', this.handleServerInfo.bind(this));
  this.on('success', this.handleServerInfo.bind(this));
  this.on('connected_list', this.handleConnectedList.bind(this));
  setTimeout((function () {
    this.on('message', this.messageHandler.handle.bind(this.messageHandler));
  }).bind(this), 1000);
	setInterval(this.checkMessageBuffer.bind(this), 400);
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
	this.send('/w ' + user + ' ' + str);
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
