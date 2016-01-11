var MessageHandler = require('./MessageHandler.js');

// - config = {
//   address: 'http://redsky.fr:8054',
//   username: '',
//   password: '',
//   mobile: false
// }
function SkyChat(config) {
  this.config = config;
  this.eventLoop = require('./EventLoop.js');
  this.lastMessage = '!';
  this.loggedIn = false;
  this.messageHandler = new MessageHandler(this);
  this.sock = require('socket.io-client').connect(config.address);
  this.userList = {};

  this.eventLoop.initSock(this.sock);
  this.eventLoop.on('connect', this.handleConnect.bind(this));
  this.eventLoop.on('log', this.handleLogin.bind(this));
}

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
    this.sock.emit('log', {
      hash: body.hash,
			pseudo: body.pseudo,
			id: body.id,
			tms: body.tms,
			mobile: this.config.mobile
    });
  }
  require('request').post({
    url: 'http://redsky.fr/ajax/account/api.php',
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
  if(this.loggedIn) return;
  this.loggedIn = true;
  this.fire('log_once', log);
  this.on('alert', this.handleServerInfo.bind(this));
  this.on('info', this.handleServerInfo.bind(this));
  this.on('success', this.handleServerInfo.bind(this));
  this.on('connected_list', this.handleConnectedList.bind(this));
  setTimeout((function () {
    this.on('message', this.messageHandler.handle.bind(this.messageHandler));
  }).bind(this), 1000);
};

SkyChat.prototype.handleServerInfo = function (msg) {
  if(typeof msg.message === 'undefined') return;
  this.eventLoop.fire('server_info', msg);
  var match = msg.message.match(/attendre (.*?) millis/);
	if(match && match.length == 2 && typeof this.lastMessage !== 'undefined') {
  	this.sendLater(this.lastMessage, match[1]);
	}
};

SkyChat.prototype.mp = function (user, str) {
	this.send('/w ' + user + ' ' + str);
};

SkyChat.prototype.on = function (name, callback) {
  this.eventLoop.on(name, callback);
};

SkyChat.prototype.send = function(message) {
	this.sock.emit('message', { message: message });
	this.lastMessage = message;
};

SkyChat.prototype.sendLater = function(msg, delay) {
	if(typeof delay === 'undefined') delay = 1000;
	setTimeout((function() { this.send(msg); }).bind(this), delay);
};

module.exports = SkyChat;
