# node-skychat

Librairie NodeJS permettant de se connecter au chat skychat.fr.

# Installation

```sh
$ npm install -S kiwec/node-skychat
```

# Utilisation

```js
var SkyChat = require('node-skychat');

SkyChat.on('log_once', function() {
  SkyChat.send('Hello World !');
});
SkyChat.on('newmessage', function(msg) {
  console.log(SkyChat.messageHandler.format(msg));
});
```
