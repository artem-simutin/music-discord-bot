"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
class Song {
    constructor(songInfo) {
        this.title = songInfo.videoDetails.title;
        (this.url = songInfo.videoDetails.video_url),
            (this.authorName = songInfo.videoDetails.author.name),
            (this.likes = songInfo.videoDetails.likes),
            (this.dislikes = songInfo.videoDetails.dislikes),
            (this.length = songInfo.videoDetails.lengthSeconds),
            (this.thumbnail = songInfo.videoDetails.thumbnails[0]);
    }
}
exports.Song = Song;
