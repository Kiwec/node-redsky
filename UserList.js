
class UserList {
	constructor(skychat) {
		this.skychat = skychat;

		this.users = [];
	}

	get(username) {
		for(let user of this.users) {
			if(user.pseudo_lower == username) {
				return user;
			}
		}

		return null;
	}

	update(ev) {
		function evget(list, username) {
			for(let user of list) {
				if(user.pseudo_lower == username) {
					return user;
				}
			}

			return null;
		}

		for(let user of ev.list) {
			if(this.get(user.pseudo_lower) == null) {
				this.skychat.fire('user_join', user);
			}
		}

		for(let user of this.users) {
			if(evget(ev.list, user.pseudo_lower) == null) {
				this.skychat.fire('user_leave', user);
			}
		}

		this.users = ev.list;
	}
}

module.exports = UserList;
