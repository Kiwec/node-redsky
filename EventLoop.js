function EventLoop() {
  this.eventList = [];
  this.sockEvents = ['alert', 'ban', 'clear', 'connect', 'connected_list',
                    'disconnect', 'error', 'forcepost', 'forcereload', 'info',
                    'log', 'message', 'message_delete', 'play_sound',
                    'room_list', 'seen', 'set_room_data', 'shake', 'success',
                    'typing_list', 'youtube_search'];
}

// Fires an event
EventLoop.prototype.fire = function (name, args) {
  console.log('EventLoop : Event "' + name + '" fired.');
  if(typeof this.eventList[name] === 'undefined') return;
  for (var i in this.eventList[name]) {
    console.log('EventLoop : Calling callback number ' + i + ' for event "' + name + '"');
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
    this.sockEvents[name] = [];
  }
  this.sockEvents[name].push(callback);
};

module.exports = new EventLoop();
