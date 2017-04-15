function EventLoop() {
  this.eventList = [];
  this.sockEvents = ['alert', 'ban', 'clear', 'connect', 'connected_list', 
	  'disconnect', 'error', 'forcepost', 'forcereload', 'info',
	  'message', 'message_delete', 'play_sound', 'pseudo_info',
	  'room_update', 'room_info', 'yt_room_history', 'yt_room_waitlist',
	  'yt_sync', 'yt_search', 'mouse_position', 'mouse_destroy',
	  'room_list', 'success', 'typing_list'];
}

// Fires an event
EventLoop.prototype.fire = function (name, args) {
  // console.log('EventLoop : Event "' + name + '" fired.');
  if(typeof this.eventList[name] === 'undefined') return;
  for (var i in this.eventList[name]) {
    // console.log('EventLoop : Calling callback number ' + i +
    //             ' for event "' + name + '"');
    this.eventList[name][i](args);
  }
};

// Registers socket.io events
EventLoop.prototype.initSock = function (sock) {
  function eventCaller(args) {
    this.fire(this.name, args);
  }
  for (var i in this.sockEvents) {
    sock.on(this.sockEvents[i], eventCaller.bind({
      fire: this.fire.bind(this),
      name: this.sockEvents[i]
    }));
  }
};

// Registers an event
EventLoop.prototype.on = function (name, callback) {
  if(typeof this.sockEvents[name] === 'undefined') {
    this.eventList[name] = [];
  }
  this.eventList[name].push(callback);
};

module.exports = new EventLoop();
