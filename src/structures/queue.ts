import {
  AudioPlayer,
  AudioResource,
  createAudioResource,
  VoiceConnection,
} from '@discordjs/voice'
import {
  Message,
  StageChannel,
  TextBasedChannel,
  VoiceChannel,
} from 'discord.js'
import ytdl from 'ytdl-core-discord'

import {
  AUDIO_FROM_VIDEO_STREAM_OPTIONS,
  LIVE_AUDIO_STREAM_OPTIONS,
} from '../../config/audioSettings'
import { createErrorEmbed } from '../embeds/error'
import { createSkipEmbed } from '../embeds/music/skipSong'
import Logger from '../services/loggers'

import { Song } from './song'

const initialPlayerState = {
  discordAudioPlayer: null,
  resource: null,
  volume: 1,
  isPlaying: false,
  isLoading: false,
  isLooped: false,
}

interface PlaySongOptions {
  readonly args: string[]
}

type ContentType = 'playlist' | 'song'

interface QueueConstructorProps {
  textChannel: TextBasedChannel
  voiceChannel: VoiceChannel | StageChannel
}

/**
 * Instance that contains songs, player and methods to control music playback
 */
class QueueAndPlayer {
  /**
   * Text channel instance where user types commands
   */
  textChannel: TextBasedChannel
  /**
   * Text channel instance where user types commands
   */
  curentMessage: Message | null
  /**
   * Voice channel instance where bot will connect
   */
  voiceChannel: VoiceChannel | StageChannel
  /**
   * Voice channel connection instance
   */
  voiceConnection: VoiceConnection | null
  /**
   * Songs queue
   */
  songs: Song[]
  /**
   * Discord audio player instance
   */
  discordAudioPlayer: AudioPlayer | null
  /**
   * Now playable resourse
   */
  resource: AudioResource | null
  /**
   * Discord bot volume (now it is unused 'cause performance issues - it's not the best features)
   */
  volume: number
  /**
   * Playing state
   */
  isPlaying: boolean
  /**
   * Loading state - is song loading from audio remote resourse and creates audio resourse
   */
  isLoading: boolean
  /**
   * Loop state
   */
  isLooped: boolean

  constructor({ textChannel, voiceChannel }: QueueConstructorProps) {
    this.textChannel = textChannel
    this.voiceChannel = voiceChannel

    // Default values
    this.voiceConnection = null
    this.curentMessage = null
    this.songs = []
    this.discordAudioPlayer = initialPlayerState.discordAudioPlayer
    this.resource = initialPlayerState.resource
    this.volume = initialPlayerState.volume
    this.isPlaying = initialPlayerState.isPlaying
    this.isLoading = initialPlayerState.isLoading
    this.isLooped = initialPlayerState.isLooped
  }

  /**
   * Gets "isLoading" state property
   */
  private getIsLoading() {
    return this.isLoading
  }

  /**
   * Sets "isLoading" state property
   * @param bool - value that will be setted to the loading state
   */
  private setLoading(bool: boolean) {
    this.isLoading = bool
  }

  /**
   * Gets "isLooped" state property
   */
  private getIsLooped() {
    return this.isLooped
  }

  /**
   * Sets "isLooped" state property
   * @param bool - value that will be setted to the loop state
   */
  private setIsLooped(bool: boolean) {
    this.isLooped = bool
  }

  /**
   * Gets "isPlaying" state property
   */
  private getIsPlaying() {
    return this.isPlaying
  }

  /**
   * Sets "isPlaying" state property
   * @param bool - value that will be setted to the playing state
   */
  private setIsPlaying(bool: boolean) {
    this.isPlaying = bool
  }

  /**
   * Returns current user message with command
   * @returns current user message
   */
  private getCurrentMessage() {
    return this.curentMessage
  }

  /**
   * Writes message to the queue instance to convinient read
   * @param message - user message with command
   */
  private initCurrentMessage(message: Message) {
    this.curentMessage = message
  }

  /**
   * Returns current text channel where message was sent
   * @returns text channel
   */
  private getTextChannel() {
    return this.textChannel
  }

  /**
   * Returns current voice channel where user who sent message is
   * @returns voice channel
   */
  private getVoiceChannel() {
    return this.voiceChannel
  }

  /**
   * Async creates audio resourse through "ytdl-core-discord"
   * @param song - song builded instance with requred params
   */
  private async createResource(song: Song) {
    const options = song.isLive
      ? LIVE_AUDIO_STREAM_OPTIONS
      : AUDIO_FROM_VIDEO_STREAM_OPTIONS

    const stream = await ytdl(song.url, options)

    if (!this.resource) {
      this.resource = createAudioResource(stream)
    }
  }

  /**
   * Adds song to the song stack (queue) and returns it
   * @param song - song builded instance with requred params
   * @returns added `song`
   */
  private addSongToQueue(song: Song) {
    return this.songs.push(song)
  }

  /**
   * Removes song from queue
   * @returns shifted `song`
   */
  private removeSongFromQueue(): Song | undefined {
    if (this.songs.length <= 0) {
      const curentMessage = this.getCurrentMessage()

      const embeds = [createErrorEmbed('There are not songs :(')]

      if (!!curentMessage) {
        curentMessage.reply({ embeds })
        return
      }

      this.getTextChannel().send({ embeds })
      return
    }

    return this.songs.shift()
  }

  private determineContentType(url: string): ContentType {
    if (url.search('&list=') > 0) return 'playlist'

    return 'song'
  }

  /**
   * =============================================
   * =              Public methods               =
   * =============================================
   */

  public playSong(message: Message, options?: PlaySongOptions) {
    Logger.info('Started play song from queue! - {PLAY SONG}')

    const args = options?.args

    // Check are arguments in user's message
    if (args && args?.length <= 0) {
      Logger.warn('No URL to play - {PLAY SONG}')
      const embeds = [
        createErrorEmbed('To play song, pass URL to the YouTube material!'),
      ]
      message.reply({ embeds })
    }

    const contentURL = options?.args[0]
    // TODO: implement audio effects functionality
    // const playbackArgs = args.slice(1) - that will be useful for audio effects implementation

    const contentType = this.determineContentType(contentURL)
  }

  public skipSong(message: Message) {
    const removedSong = this.removeSongFromQueue()

    if (removedSong) {
      const currentMessage = this.getCurrentMessage()

      if (!currentMessage) {
        Logger.warn('There is not curent message! - {SKIP SONG}')
        return
      }

      const embeds = [createSkipEmbed(removedSong, currentMessage)]
      const textChannel = this.getTextChannel()
      textChannel.send({ embeds })

      this.playSong(currentMessage)

      Logger.info('Skipped song! - {SKIP SONG}')
      return
    }
  }
}

export default QueueAndPlayer
