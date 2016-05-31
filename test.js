var SkyChat = require('./SkyChat.js').init({
  username: 'foo',
  password: 'bar123'
});

SkyChat.on('log_once', () => {
  SkyChat.send('cc');
});

SkyChat.on('newmessage', (msg) => {
  console.log(SkyChat.format(msg));
});
