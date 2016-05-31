# node-skychat

Librairie NodeJS permettant de se connecter au chat skychat.fr.

# Installation

```sh
$ npm install -S node-skychat
```

# Utilisation

```js
var SkyChat = require('node-skychat').init({
	username: 'foo',
	password: 'bar123'
});

SkyChat.on('log', () => {
  SkyChat.send('Hello world !');
});

SkyChat.on('newmessage', (msg) => {
  console.log(SkyChat.format(msg));
});
```
