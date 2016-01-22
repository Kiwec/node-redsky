# node-redsky

Librairie NodeJS permettant de se connecter au chat redsky.fr.

# Installation

```sh
$ npm install -S kiwec/node-redsky
```

# Utilisation

```js
var SkyChat = require('node-redsky').init({
	address: 'http://redsky.fr:8054',
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
