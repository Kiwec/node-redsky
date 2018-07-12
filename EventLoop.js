class EventLoop {
	constructor() {
		this.callbacks = {};
	}

	// Fires an event
	fire(name, args) {
		if(typeof this.callbacks[name] === 'undefined') return;
		for(let callback of this.callbacks[name]) {
			callback(args);
		}
	}

	// Registers socket.io events
	initSock(sock) {
		let sockEvents = ['alert', 'ban', 'clear', 'connect',
		'connected_list', 'disconnect', 'error', 'forcepost', 'forcereload',
		'info', 'message', 'message_delete', 'play_sound', 'pseudo_info',
		'room_update', 'room_info', 'yt_room_history', 'yt_room_waitlist',
		'yt_sync', 'yt_search', 'mouse_position', 'mouse_destroy',
		'room_list', 'success', 'typing_list'];

		for (let eventName of sockEvents) {
			sock.on(eventName, data => this.fire(eventName, data));
		}
	}

	// Registers an event
	on(name, callback) {
		if(typeof this.callbacks[name] === 'undefined') {
			this.callbacks[name] = [];
		}
		this.callbacks[name].push(callback);
	}
}

module.exports = new EventLoop();
