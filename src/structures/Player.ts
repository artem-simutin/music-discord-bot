import {
  AudioPlayer,
  AudioResource,
  createAudioResource,
} from '@discordjs/voice'
import { Song } from '../builders/song'
import ytdl, { downloadOptions as DownloadOptions } from 'ytdl-core'

const initialPlayerState = {
  discordAudioPlayer: null,
  resource: null,
  volume: 1,
  isPlaying: false,
  isLoading: false,
  isLooped: false,
}

/**
 * =========== Audio Stream settings ===========
 * =    The most dangerous part of the bot     =
 * =============================================
 */

const LIVE_AUDIO_STREAM_OPTIONS = {
  highWaterMark: 1 << 25,
  liveBuffer: 4900,
}

const AUDIO_FROM_VIDEO_STREAM_OPTIONS = {
  quality: 'highestaudio',
  filter: 'audioonly',
  highWaterMark: 1 << 25,
  liveBuffer: 40000,
  dlChunkSize: 10,
}

/**
 * ==================== END ====================
 */

class Player {
  discordAudioPlayer: AudioPlayer | null
  resource: AudioResource | null
  volume: number
  isPlaying: boolean
  isLoading: boolean
  isLooped: boolean

  constructor() {
    this.discordAudioPlayer = initialPlayerState.discordAudioPlayer
    this.resource = initialPlayerState.resource
    this.volume = initialPlayerState.volume
    this.isPlaying = initialPlayerState.isPlaying
    this.isLoading = initialPlayerState.isLoading
    this.isLooped = initialPlayerState.isLooped
  }

  createResource(song: Song) {
    const options: DownloadOptions = song.isLive
      ? LIVE_AUDIO_STREAM_OPTIONS
      : AUDIO_FROM_VIDEO_STREAM_OPTIONS

    const stream = ytdl(song.url, options)

    if (!this.resource) {
      this.resource = createAudioResource(stream)
    }
  }
}

export default Player
