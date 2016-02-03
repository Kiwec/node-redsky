# node-skychat

Librairie NodeJS permettant de se connecter au chat skychat.fr.

# Installation

```sh
$ npm install -S node-skychat
```

# Utilisation

```js
var SkyChat = require('node-skychat').init({
	address: 'http://skychat.fr:8054',
	username: 'foo',
	password: 'bar',
	mobile: false
});

SkyChat.on('log_once', function() {
  SkyChat.send('Hello World !');
});

SkyChat.on('newmessage', function(msg) {
  console.log(SkyChat.format(msg));
});
```
