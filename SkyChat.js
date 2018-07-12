const MessageHandler = require('./MessageHandler.js');
const Player = require('./Player.js');
const UserList = require('./UserList.js');

class SkyChat {
	constructor() {
		this.messageHandler = new MessageHandler(this);
		this.messageBuffer = [];
		this.lastMessage = '!';
		this.current_room = -1;

	}

	checkMessageBuffer() {
		if(this.messageBuffer.length > 0) {
			this.lastMessage = this.messageBuffer.shift();
			this.sock.emit('message', { message: this.lastMessage });
		}
	}

	init(config) {
		// If the SkyChat object has already been initialized
		if(typeof this.config !== 'undefined') {
			// Return current SkyChat object
			return this;
		}

		this.config = config;
		this.eventLoop = require('./EventLoop.js');
		this.player = new Player(this);
		this.userList = new UserList(this);
		this.getLoginToken(this.initSock.bind(this));

		return this;
	}

	initSock() {
		this.sock = require('socket.io-client').connect('https://skychat.fr:8056');
		this.eventLoop.initSock(this.sock);
		this.eventLoop.on('connect', this.handleConnect.bind(this));
	}

	fire(name, args) {
		this.eventLoop.fire(name, args);
	}

	format(msg) {
		return this.messageHandler.format(msg);
	}

	/**
	* Obtient le token de login depuis l'API skychat.fr
	* Appelle callback().
	* En cas d'erreur : pas d'appel au callback.
	*/
	getLoginToken(callback) {
		const request = require('request');
		request.post({
			url: 'https://skychat.fr/ajax/account/api2.php',
			form: {
				pseudo: this.config.username,
				pass: this.config.password
			}
		}, (err, res, body) => {
			if(err) return console.log(err);
			this.credentials = JSON.parse(body);
			callback();
		});
	}

	handleConnect() {
		this.sock.emit('log', this.credentials);
		this.send('/join 0');
		this.handleLogin(this.credentials);
	}

	handleLogin(log) {
		this.pseudo = log.pseudo;
		this.fire('log', log);
		this.fire('log_once', log);
		this.on('alert', this.handleServerInfo.bind(this));
		this.on('error', this.handleServerInfo.bind(this));
		this.on('info', this.handleServerInfo.bind(this));
		this.on('success', this.handleServerInfo.bind(this));
		this.on('pseudo_info', this.handlePseudoInfo.bind(this));
		this.on('connected_list', data => this.userList.update(data));
		this.on('yt_sync', data => this.player.update(data));
		this.on('room_list', (data) => {
			for(const i in data) {
				if(data[i].id == this.current_room) {
					this.fire('room_name', data[i].name);
					break;
				}
			}
		});
		setTimeout(() => {
			this.on('message', this.messageHandler.handle.bind(this.messageHandler));
		}, 1000);
		setInterval(this.checkMessageBuffer.bind(this), 400);
	}

	handlePseudoInfo(data) {
		if(this.current_room != data.current_room) {
			this.current_room = data.current_room;
			this.send('/roomlist');
		}
	}

	handleServerInfo(msg) {
		if(typeof msg.message === 'undefined') return;
		this.eventLoop.fire('server_info', msg);
		const match = msg.message.match(/attendre (.*?) millis/);
		if(match && match.length == 2 && typeof this.lastMessage !== 'undefined') {
			this.messageBuffer.unshift(this.lastMessage);
		}
	}

	mp(user, str) {
		this.send(`/mp ${user} ${str}`);
	}

	on(name, callback) {
		this.eventLoop.on(name, callback);
	}

	send(message) {
		this.messageBuffer.push(message);
	}

	sendLater(msg, delay) {
		if(typeof delay === 'undefined') delay = 1000;
		setTimeout(() => { this.send(msg); }, delay);
	}
}

module.exports = new SkyChat();
