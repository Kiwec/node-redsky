# node-redsky

Librairie NodeJS permettant de se connecter au chat redsky.fr.

# Installation

```sh
$ npm install -S kiwec/node-redsky
```

# Utilisation

```js
var SkyChat = require('node-redsky');

SkyChat.on('log_once', function() {
  SkyChat.send('Hello World !');
});
SkyChat.on('newmessage', function(msg) {
  console.log(SkyChat.format(msg));
});
// Autres events : command, givepoints, rand
```
