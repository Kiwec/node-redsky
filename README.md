# node-skychat

Librairie NodeJS permettant de se connecter au chat skychat.fr.

# Installation

```sh
npm i node-skychat
```

# Utilisation

```js
const SkyChat = require('node-skychat').init({
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

# Events

Certains events sont ajoutes en plus de ceux du tchat :

* command({ msg, user, args, nbArgs }) : apres envoi d'une !commande

* givepoints({ from, amount, to, commission }) : apres envoi de skypoints

* list(userlist) : quand un utilisateur rejoint, quitte, ou commence/arrete d'ecrire

* log(credentials) : apres connexion

* log_once(credentials) : apres connexion, emis une seule fois

* newmessage(msg) : quand un nouveau message est recu

* player_next({ id, title, duration, position, user }) : lorsqu'une nouvelle video est jouee

* rand({ max, pseudo, number }) : lorsque /rand est utilise

* room_name(name) : apres avoir rejoint une room
La room 0 est automatiquement rejointe.

* server_info(msg) : message important du serveur

* typing(userlist) : quand un utilisateur commence/arrete d'ecrire

* user_join(user) : quand un utilisateur rejoint la room

* user_leave(user) : quand un utilisateur sort de la room
