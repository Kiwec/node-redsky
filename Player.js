
class Player {
	constructor(skychat) {
		this.skychat = skychat;

		/// Url of the youtube video
		this.id = '';

		/// Title of the video
		this.title = '';

		/// Duration of the video
		this.duration = 0;

		/// Position in the video, in seconds
		this.position = 0;

		/// User who played the video
		this.user = '';
	}

	update(yt_sync) {
		this.title = yt_sync.title || '';
		this.position = yt_sync.cursor || 0;
		this.user = yt_sync.dj || '';

		if(yt_sync.id != this.id) {
			this.id = yt_sync.id || null;
			this.duration = yt_sync.duration || 0;

			// Notify clients a new video is playing
			this.skychat.fire('player_next', this);
		}
	}
}

module.exports = Player;
