import { InfoData, YouTubeVideo } from 'play-dl'

export class Song {
  title: string | undefined
  url: string
  likes: number | null
  thumbnail: YouTubeVideo['thumbnails'][0]
  authorName: string | undefined
  length: number
  views: number
  isLive: boolean
  publishDate: string | undefined

  constructor(songInfo: InfoData) {
    this.title = songInfo.video_details.title
    this.url = songInfo.video_details.url
    this.authorName = songInfo.video_details.channel?.name
    this.likes = songInfo.video_details.likes
    this.length = songInfo.video_details.durationInSec
    this.thumbnail = songInfo.video_details.thumbnails[0]
    this.views = songInfo.video_details.views
    this.isLive = songInfo.video_details.live
    this.publishDate = songInfo.video_details.uploadedAt
  }
}
