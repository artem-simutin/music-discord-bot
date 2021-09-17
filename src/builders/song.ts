import {
  Author,
  thumbnail as Thumbnail,
  videoInfo as VideoInfo,
} from 'ytdl-core'

export class Song {
  title: string
  url: string
  likes: number | null
  dislikes: number | null
  thumbnail: Thumbnail
  authorName: string
  length: string

  constructor(songInfo: VideoInfo) {
    this.title = songInfo.videoDetails.title
    ;(this.url = songInfo.videoDetails.video_url),
      (this.authorName = songInfo.videoDetails.author.name),
      (this.likes = songInfo.videoDetails.likes),
      (this.dislikes = songInfo.videoDetails.dislikes),
      (this.length = songInfo.videoDetails.lengthSeconds),
      (this.thumbnail = songInfo.videoDetails.thumbnails[0])
  }
}
