var $ = require('cheerio').load('');
var colors = require('colors/safe');

function MessageHandler(skyChat) {
  this.skyChat = skyChat;
  this.lastTms = 0;
}

MessageHandler.prototype.clean = function (msg) {
  var str = msg;
  if(typeof msg === 'undefined') return 'undefined';
  if(typeof msg.message !== 'undefined') str = msg.message;
  if(str.indexOf(' ') == 0) str = str.substring(1);
  var noSmiley = str.replace(/<img.*?alt="(.*?)".*?>/g, '$1');
  var noImg = noSmiley.replace(/<img.?src="(.*?)".*?>/g, 'http://skychat.fr/$1');
  var noHTML = $('<p>' + noImg + '</p>').text();
  return noHTML;
};

MessageHandler.prototype.format = function (msg) {
  switch(msg.message_type) {
    case 'bot_message':
    case 'user_message':
      return this.formatUser(msg) + this.clean(this.formatCitation(msg));
    case 'user_me':
      return '* ' + this.formatColor(msg) + ' ' +
             colors.italic(this.clean(msg));
    case 'user_mp':
      return colors.green('[MP]') + this.formatUser(msg) + this.clean(msg);
    case 'user_spoil':
      return colors.red.bold('[SPOIL]') + colors.black(this.clean(msg));
    default:
      if(typeof msg.message === 'undefined') return;
      return colors.red(this.clean(msg));
  }
};

MessageHandler.prototype.formatCitation = function (msg) {
  var str = msg;
  if(typeof msg.message !== 'undefined') str = msg.message;
  var citation = str.match(/<bl.*?>(.*?)<\/b.*?e>/);
  if(citation) {
    var user_cite = citation[0].match(/.*?>Par (.*?)<.*?r>/);
    citation = citation[0].replace(/.*?r>/, '');
    var message = str.replace(/.*ote>/, '');
    str = '[' + user_cite[1] + '] ' + citation;
    if(message !== ' ') str += '\n -&gt; ' + message;
  }

  return str;
};

MessageHandler.prototype.formatColor = function(msg) {
  switch(msg.color) {
    case '#ef4848': return colors.red.bold(msg.pseudo);
    case '#457dbb': return colors.red(msg.pseudo);
    case '#bf00ff': return colors.green(msg.pseudo);
    case '#046380': return colors.blue(msg.pseudo);
    case '#85c630': return colors.cyan(msg.pseudo);
    case '#ffab46': return colors.yellow(msg.pseudo);
    case '#f5a6bf': return colors.magenta(msg.pseudo);
    default: return colors.white(msg.pseudo);
  }
};

MessageHandler.prototype.formatUser = function (msg) {
  return '[' + this.formatColor(msg) + '] ';
};

MessageHandler.prototype.handle = function (msg) {
  if(typeof msg === 'undefined') return;

  if(msg.tms < this.lastTms) return;
  this.lastTms = msg.tms;

  if(msg.message.indexOf('!') === 1) {
    this.handleCommand(msg);
    return;
  }

  if(msg.pseudo == 'SkychatBot') {
    this.handleBotMessage(msg);
  }

  this.skyChat.eventLoop.fire('newmessage', msg);
};

MessageHandler.prototype.handleBotMessage = function (msg) {
  msg.message_type = 'bot_message';
  var cleanMsg = this.clean(msg);

  // Points transfer
  if(cleanMsg.indexOf(' a donné ') !== -1) {
    var giveMsg = cleanMsg.match(/(.+) a donné (\d+)\$ à (.+) \( commission (\d+)\$ \)/);
    this.skyChat.eventLoop.fire('givepoints', {
      from: giveMsg[1],
      amount: parseInt(giveMsg[2], 10),
      to: giveMsg[3],
      commission: parseInt(giveMsg[4], 10)
    });
  // Random number generation
  } else if(cleanMsg.indexOf('demandé par') !== -1) {
    var match = cleanMsg.match(/Nombre entre (\d+) et (\d+) demandé par (.+): (\d+)/);
    if(!match) {
      console.error('Failed to match /rand :');
      console.log(cleanMsg);
      console.log(msg.message);
      return;
    }

    this.skyChat.eventLoop.fire('rand', {
      min: parseInt(match[1], 10),
      max: parseInt(match[2], 10),
      pseudo: match[3],
      number: match[4]
    });
  }
};

MessageHandler.prototype.handleCommand = function (msg) {
  var cleanMsg = this.clean(msg);
  var subArg = cleanMsg.indexOf(' ') + 1;
	this.skyChat.eventLoop.fire('command', {
		msg: msg,
		user: msg.pseudo,
		name: cleanMsg.substring(1).split(' ')[0],
		args: subArg ? cleanMsg.substring(subArg) : '',
		nbArgs: cleanMsg.split(' ').length - 1
	});
};

module.exports = MessageHandler;
