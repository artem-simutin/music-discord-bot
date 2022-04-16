import { thumbnail as Thumbnail, videoInfo as VideoInfo } from 'ytdl-core'

export class Song {
  title: string
  url: string
  likes: number | null
  thumbnail: Thumbnail
  authorName: string
  length: string
  views: string
  isLive: boolean

  constructor(songInfo: VideoInfo) {
    this.title = songInfo.videoDetails.title
    this.url = songInfo.videoDetails.video_url
    this.authorName = songInfo.videoDetails.author.name
    this.likes = songInfo.videoDetails.likes
    this.length = songInfo.videoDetails.lengthSeconds
    this.thumbnail = songInfo.videoDetails.thumbnails[0]
    this.views = songInfo.videoDetails.viewCount
    this.isLive = songInfo.videoDetails.isLiveContent
  }
}
