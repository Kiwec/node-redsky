var EventLoop = require('./EventLoop.js');

// - config = {
//   address: 'http://skychat.fr:8054',
//   username: '',
//   password: '',
//   mobile: false
// }
function SkyChat(config) {
  this.config = config;
  this.eventLoop = new EventLoop(this);
  this.lastMessage = '!';
  this.loggedIn = false;
  this.messageHandler = require('./MessageHandler.js');
  this.sock = require('socket.io-client').connect(config.address);

  this.eventLoop.initSock(this.sock);
  this.eventLoop.on('connect', this.handleConnect.bind(this));
  this.eventLoop.on('log', this.handleLogin.bind(this));
}

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
    url: 'http://skychat.fr/ajax/account/api.php',
    form: {
      pseudo: this.config.username,
      pass: this.config.password
    }
  }, login.bind(this));
};

SkyChat.prototype.handleLogin = function (log) {
  if(this.loggedIn) return;
  this.loggedIn = true;
  this.eventLoop.fire('log_once', log);
  this.eventLoop.on('alert', this.handleServerInfo.bind(this));
  this.eventLoop.on('info', this.handleServerInfo.bind(this));
  this.eventLoop.on('success', this.handleServerInfo.bind(this));
  setTimeout((function () {
    this.eventLoop.on('message', this.messageHandler.bind(this.messageHandler));
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

SkyChat.prototype.send = function(message) {
	this.sock.emit('message', { message: message });
	this.lastMessage = message;
};

SkyChat.prototype.sendLater = function(msg, delay) {
	if(typeof delay === 'undefined') delay = 1000;
	setTimeout((function() { this.send(msg); }).bind(this), delay);
};

module.exports = SkyChat;
