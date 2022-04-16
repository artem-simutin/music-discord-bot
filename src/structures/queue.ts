import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import {
  Message,
  StageChannel,
  TextBasedChannel,
  VoiceChannel,
} from 'discord.js'
import ytdl from 'ytdl-core-discord'
import ytpl from 'ytpl'

import {
  AUDIO_FROM_VIDEO_STREAM_OPTIONS,
  LIVE_AUDIO_STREAM_OPTIONS,
} from '../../config/audioSettings'
import config from '../../config/config'
import { createErrorEmbed } from '../embeds/error'
import { createStartPlayingEmbed } from '../embeds/music/newSong'
import { createPlaylistInfoEmbed } from '../embeds/music/playlistInfo'
import { createSkipEmbed } from '../embeds/music/skipSong'
import { createAddSongToQueue } from '../embeds/music/songToQueue'
import Logger from '../services/loggers'
import parsePlaylist, {
  SuccessfulReturnResponse,
} from '../services/parsePlaylist'

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
  readonly args?: string[]
  readonly ignoreParse?: boolean
}

type ContentType = 'playlist' | 'song'

interface QueueConstructorProps {
  textChannel: TextBasedChannel
  voiceChannel: VoiceChannel | StageChannel
  disconnectCallback: () => void
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
  /**
   * Timeout for disconnecting bot from voice channel
   */
  timeout: NodeJS.Timeout | null
  /**
   * Callback that will be called when bot disconnects from voice channel
   */
  disconnectCallback: () => void | null

  constructor({
    textChannel,
    voiceChannel,
    disconnectCallback,
  }: QueueConstructorProps) {
    Logger.info('Inited Queue constructor! - {QUEUE CONSTRUCTOR}')

    this.textChannel = textChannel
    this.voiceChannel = voiceChannel
    this.disconnectCallback = disconnectCallback

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
    this.timeout = null
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
   * Returns current voice connection or null if not
   * @returns current voice connection
   */
  private getVoiceConnection(): VoiceConnection | null {
    return this.voiceConnection
  }

  /**
   * Inits voice connection
   * @param voiceConnection discord voice connecton info
   */
  private initVoiceConnection(voiceConnection: VoiceConnection): void {
    Logger.info(
      "Connected to the user's voice channel! - {INIT VOICE CONNECTION}"
    )
    this.voiceConnection = voiceConnection
  }

  /**
   * Creates Discord audio player and returns it
   */
  private createDiscordAudioPlayer() {
    if (this.discordAudioPlayer) return this.discordAudioPlayer

    Logger.info('Created Discord audio player! - {CREATE DISCORD AUDIO PLAYER}')
    this.discordAudioPlayer = createAudioPlayer()

    return this.discordAudioPlayer
  }

  /**
   * Get current audio resource
   * @returns current audio resource
   */
  private getAudioResource(): AudioResource | null {
    return this.resource
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
   * Returns current song queue
   * @returns songs queue
   */
  private getSongQueue(): Song[] {
    return this.songs
  }

  /**
   * Adds song to the song queue and returns it
   * @param song - song builded instance with requred params
   * @returns new array length
   */
  private addSongToQueue(song: Song): number {
    return this.songs.push(song)
  }

  /**
   * Adds playlist to the song queue
   * @param songs - songs array of builded instances with requred params
   * @returns new array length
   */
  private addPlaylistToQueue(songs: Song[]): number {
    this.songs = [...this.songs, ...songs]
    return this.songs.length
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

  /**
   * Determines content type from YouTube URL
   * @param url - youtube url
   * @returns content type - "song" | "playins"
   */
  private determineContentType(url: string): ContentType {
    if (url.search('&list=') > 0) return 'playlist'

    return 'song'
  }

  private createDisconnectTimeout() {
    const timeout = setTimeout(() => {
      this.disconnectBotFromVoiceChannel()
    }, config.botDisconnectTimeout);

    this.timeout = timeout
  }

  /**
   * Disconnect bot from voice channel
   */
  private disconnectBotFromVoiceChannel() {
    const voiceConnection = this.getVoiceConnection()

    if (voiceConnection) {
      Logger.info(
        'Disconnected from voice channel! - {DISCONNECT BOT FROM VOICE CHANNEL}'
      )
      voiceConnection.destroy()
    }

    this.discordAudioPlayer = initialPlayerState.discordAudioPlayer
    this.isLoading = initialPlayerState.isLoading
    this.isLooped = initialPlayerState.isLooped
    this.isPlaying = initialPlayerState.isPlaying
    this.resource = initialPlayerState.resource
    this.volume = initialPlayerState.volume
    this.voiceConnection = null

    this.disconnectCallback && this.disconnectCallback()
  }

  /**
   * =============================================
   * =              Public methods               =
   * =============================================
   */

  public async play(message: Message, options?: PlaySongOptions) {
    Logger.info('Started play song from queue! - {PLAY}')

    this.initCurrentMessage(message)

    const isIgnoreParse = options?.ignoreParse
    const args = options?.args

    if (!isIgnoreParse) {
      // Check are arguments in user's message
      if (!args || (args && args.length <= 0)) {
        Logger.warn('No URL to play! - {PLAY}')
        const embeds = [
          createErrorEmbed('To play song, pass URL to the YouTube material!'),
        ]
        message.reply({ embeds })
        return
      }

      const contentURL = args[0]
      // TODO: implement audio effects functionality
      // const playbackArgs = args.slice(1) - that will be useful for audio effects implementation

      const contentType = this.determineContentType(contentURL)

      /**
       * If content type is "song"
       */
      if (contentType === 'song') {
        try {
          this.setLoading(true)

          const isValidURL = ytdl.validateURL(contentURL)

          if (!isValidURL) {
            Logger.warn('Is not valid YouTube URL! - {PLAY}')
            const embeds = [createErrorEmbed('Is not valid YouTube URL!')]
            const message = this.getCurrentMessage()
            if (!message) {
              Logger.warn('No message to reply on invalid URL! - {PLAY}')
              return
            }
            message.reply({ embeds })
            return
          }

          const songInfoFromYoutube = await ytdl.getInfo(contentURL)

          const song = new Song(songInfoFromYoutube)

          this.addSongToQueue(song)

          const message = this.getCurrentMessage()

          if (!message) {
            Logger.warn(
              'There is not message to reply on song add to queue! - {PLAY}'
            )
            return
          }

          const embeds = [
            createAddSongToQueue(song, message, this.getSongQueue()),
          ]

          const textChannel = this.getTextChannel()

          textChannel.send({ embeds })
        } catch (error) {
          Logger.error('Something went wrong with getting song! - {PLAY}')
          const embeds = [
            createErrorEmbed('Something went wrong with getting song!'),
          ]
          const textChannel = this.getTextChannel()
          textChannel.send({ embeds })
          return
        } finally {
          this.setLoading(false)
        }
      }

      /**
       * If content type is "playlist"
       */
      if (contentType === 'playlist') {
        try {
          this.setLoading(true)

          const playlist = await ytpl(contentURL)

          const parsedSongs = await parsePlaylist(playlist)

          const validPlaylistSongs = parsedSongs.filter((song) => {
            if (song.successful === false && song._failedItem) {
              const embeds = [
                createErrorEmbed(
                  `Cant add song to queue: ${song._failedItem.title}!`
                ),
              ]
              const textChannel = this.getTextChannel()
              textChannel.send({ embeds })
              return false
            }

            return true
          }) as SuccessfulReturnResponse[]

          const songsArrayFromParsedPlaylist = validPlaylistSongs.map(
            (validSong) => validSong.item
          )

          this.addPlaylistToQueue(songsArrayFromParsedPlaylist)

          const message = this.getCurrentMessage()

          if (!message) return

          const embeds = [
            createPlaylistInfoEmbed(playlist, this.getSongQueue(), message),
          ]

          message.reply({ embeds })
        } catch (error) {
          Logger.error(
            'Failed to parse playlist and add it to the queue! - {PLAY}'
          )
          const message = this.getCurrentMessage()
          if (!message) return
          const embeds = [
            createErrorEmbed('Something went wrong while parsing playlist!'),
          ]
          message.reply({ embeds })
          return
        } finally {
          this.setLoading(false)
        }
      }
    }

    /**
     * Music plalying section
     */

    const voiceChannel = this.getVoiceChannel()

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    })

    this.initVoiceConnection(connection)

    const voiceConnection = this.getVoiceConnection()

    if (!voiceConnection) {
      Logger.warn('There is not active connection! - {PLAY}')

      const embeds = [
        createErrorEmbed("I am isn't in the active voice channel!"),
      ]

      const textChannel = this.getTextChannel()

      textChannel.send({ embeds })

      return
    }

    const player = this.createDiscordAudioPlayer()

    /**
     * Event listeners
     */

    voiceConnection.on(VoiceConnectionStatus.Ready, async () => {
      Logger.info('Voice Connection is Ready! - {PLAY}')

      const songQueue = this.getSongQueue()

      if (songQueue.length <= 0) {
        Logger.warn('There is not song to play: songs queue is empty! - {PLAY}')
        return
      }

      const song = this.isLooped ? songQueue[0] : this.removeSongFromQueue()

      if (!song) {
        Logger.info('List is ended! - {PLAY}')
        return
      }

      const message = this.getCurrentMessage()

      if (!message) return

      const embeds = [createStartPlayingEmbed(song, message)]

      const textChannel = this.getTextChannel()

      textChannel.send({ embeds })

      await this.createResource(song)

      const audioResoure = this.getAudioResource()

      if (!audioResoure) {
        Logger.warn('There is not audio resourse to play! - {PLAY}')
        return
      }

      voiceConnection.subscribe(player)
      player.play(audioResoure)
    })

    player.on(AudioPlayerStatus.Idle, () => {
      const songQueue = this.getSongQueue()

      if ((songQueue.length = 0)) {
        this.createDisconnectTimeout()
        return
      }

      this.play(message, {
        ignoreParse: true,
      })
    })
  }

  public skipSong(message: Message) {
    this.initCurrentMessage(message)

    const removedSong = this.removeSongFromQueue()

    if (removedSong) {
      const currentMessage = this.getCurrentMessage()

      if (!currentMessage) {
        Logger.warn('There is not current message! - {SKIP SONG}')
        return
      }

      const embeds = [createSkipEmbed(removedSong, currentMessage)]
      const textChannel = this.getTextChannel()
      textChannel.send({ embeds })

      this.play(currentMessage, {
        ignoreParse: true,
      })

      Logger.info('Skipped song! - {SKIP SONG}')
      return
    }
  }
}

export default QueueAndPlayer
