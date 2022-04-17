import playDL from 'play-dl'
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import {
  Message,
  StageChannel,
  TextBasedChannel,
  VoiceChannel,
} from 'discord.js'
import ytpl from 'ytpl'

// import {
//   AUDIO_FROM_VIDEO_STREAM_OPTIONS,
//   LIVE_AUDIO_STREAM_OPTIONS,
// } from '../../config/audioSettings'
import config from '../../config/config'
import { createDisconnectEmbed } from '../embeds/disconnect'
import { createErrorEmbed } from '../embeds/error'
import { createCurrentSongEmbed } from '../embeds/music/currentSong'
import { createLookingForSong } from '../embeds/music/lookingForSong'
import { createLoopEmbed } from '../embeds/music/loop'
import { createStartPlayingEmbed } from '../embeds/music/newSong'
import { createPauseEmbed } from '../embeds/music/pause'
import { createPlaylistInfoEmbed } from '../embeds/music/playlistInfo'
import { createSkipEmbed } from '../embeds/music/skipSong'
import { createAddSongToQueue } from '../embeds/music/songToQueue'
import Logger from '../services/loggers'
import parsePlaylist, {
  SuccessfulReturnResponse,
} from '../services/parsePlaylist'

import { Song } from './song'
import { createLookingForPlaylist } from '../embeds/music/lookingForPlaylist'
import { createUnPauseEmbed } from '../embeds/music/unpause'

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

interface PlaySongThroughDiscordPlayerOpions {
  dontShowNextSong?: boolean
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
  private textChannel: TextBasedChannel
  /**
   * Voice channel instance where bot will connect
   */
  private voiceChannel: VoiceChannel | StageChannel
  /**
   * Voice channel connection instance
   */
  private voiceConnection: VoiceConnection | null
  /**
   * Songs queue
   */
  private songs: Song[]
  /**
   * Discord audio player instance
   */
  private discordAudioPlayer: AudioPlayer | null
  /**
   * Now playable resourse
   */
  private resource: AudioResource | null
  /**
   * Discord bot volume (now it is unused 'cause performance issues - it's not the best features)
   */
  private volume: number
  /**
   * Loading state - is song loading from audio remote resourse and creates audio resourse
   */
  private isLoading: boolean
  /**
   * Loop state
   */
  private isLooped: boolean
  /**
   * Timeout for disconnecting bot from voice channel
   */
  private timeout: ReturnType<typeof setTimeout> | null
  /**
   * Callback that will be called when bot disconnects from voice channel
   */
  private disconnectCallback: () => void | null

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
    this.songs = []
    this.discordAudioPlayer = initialPlayerState.discordAudioPlayer
    this.resource = initialPlayerState.resource
    this.volume = initialPlayerState.volume
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

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    })

    this.discordAudioPlayer = player

    return player
  }

  /**
   * Get current audio resource
   * @returns current audio resource
   */
  private getAudioResource(): AudioResource | null {
    return this.resource
  }

  /**
   * Creates audio resourse through "ytdl-core"
   * @param song - song builded instance with requred params
   */
  private async createResource(song: Song) {
    // const options = song.isLive
    //   ? LIVE_AUDIO_STREAM_OPTIONS
    //   : AUDIO_FROM_VIDEO_STREAM_OPTIONS

    const stream = await playDL.stream(song.url)

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    })

    this.resource = resource

    Logger.info('Audio resource is created! - {CREATE AUDIO RESOURCE}')

    return resource
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
  private addSongToQueue(song: Song, message?: Message): void {
    Logger.info('Song is added to the queue! - {ADD SONG TO QUEUE}')

    this.songs.push(song)

    const songQueue = this.getSongQueue()

    if (songQueue.length > 1 && message) {
      const embeds = [createAddSongToQueue(song, message, songQueue)]

      const textChannel = this.getTextChannel()

      textChannel.send({ embeds })
    }

    return
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
   * Removes song from queue - if no song, returns undefined
   * @returns shifted `song`
   */
  private removeSongFromQueue(message?: Message): Song | undefined {
    if (this.songs.length <= 0) {
      const embeds = [createErrorEmbed('There are not songs :(')]

      if (message) {
        message.reply({ embeds })
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

  /**
   * Create disconnect timeout for dissconnecting bot from voice channel
   */
  private createDisconnectTimeout() {
    Logger.info('Created disconnect timeout! - {CREATE DISCONNECT TIMEOUT}')
    this.clearTimeout()

    const timeout = setTimeout(() => {
      this.disconnectBotFromVoiceChannel()
    }, config.botDisconnectTimeout)

    this.timeout = timeout
  }

  /**
   * Clears timeout if it is
   */
  private clearTimeout(): void {
    const timeout = this.timeout

    if (!timeout) {
      Logger.warn('There is no timeout')
      return
    }

    clearTimeout(timeout)
    this.timeout = null
  }

  /**
   * Gets Discord Audio player instance
   */
  private getPlayer(): AudioPlayer | null {
    return this.discordAudioPlayer
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

      if (!voiceConnection) return

      voiceConnection.destroy()

      const embeds = [createDisconnectEmbed()]

      const textChannel = this.getTextChannel()

      textChannel.send({ embeds })

      return
    }

    this.discordAudioPlayer = initialPlayerState.discordAudioPlayer
    this.isLoading = initialPlayerState.isLoading
    this.isLooped = initialPlayerState.isLooped
    this.resource = initialPlayerState.resource
    this.volume = initialPlayerState.volume
    this.voiceConnection = null

    this.clearTimeout()

    Logger.info('Cleared timeout! - {DISCONNECT BOT FROM VOICE CHANNEL}')

    this.disconnectCallback()

    return
  }

  /**
   * Plays passed song through discord player
   */
  private async playSongThroughDiscordPlayer(
    message: Message,
    song: Song,
    options?: PlaySongThroughDiscordPlayerOpions
  ) {
    if (!options?.dontShowNextSong) {
      const embeds = [createStartPlayingEmbed(song, message)]

      const textChannel = this.getTextChannel()

      textChannel.send({ embeds })
    }

    const audioResoure = await this.createResource(song)

    const voiceConnection = this.getVoiceConnection()

    if (!voiceConnection) {
      Logger.warn(
        'There is no connection! - {PLAY SONG THROUGH DISCORD PLAYER}'
      )
      return
    }

    if (!audioResoure) {
      Logger.warn('There is no audio resourse to play! - {PLAY}')
      return
    }

    const player = this.getPlayer()

    if (!player) {
      Logger.warn('There is no player! - {PLAY SONG THROUGH DISCORD PLAYER}')
      return
    }

    const isSubscription = voiceConnection.subscribe(player)

    if (isSubscription) {
      Logger.info('Player is subscribed! - {PLAY}')
      Logger.info(' ')
    }

    player.play(audioResoure)
    Logger.info('Started play song from queue! - {PLAY}')
  }

  /**
   * Gets current playing song or null if no current playing song
   * @returns playing song or null
   */
  // private getCurrentSong(): Song | null {
  //   return this.currentPlayingSong
  // }

  /**
   * Sets curernt playing song
   * @param song current song
   */
  // private setCurrentSong(song: Song): void {
  //   this.currentPlayingSong = song
  // }

  /**
   * Clears current playing song (sets it as null)
   */
  // private clearCurrentSong(): void {
  //   this.currentPlayingSong = null
  // }

  /**
   * =============================================
   * =              Public methods               =
   * =============================================
   */

  public async play(message: Message, options?: PlaySongOptions) {
    const isLoading = this.getIsLoading()

    if (isLoading) {
      Logger.warn('Content is already in loding state! - {PLAY}')
      return
    }

    this.clearTimeout()

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

      const contentURL = args[1]
      // TODO: implement audio effects functionality
      // const playbackArgs = args.slice(1) - that will be useful for audio effects implementation

      const contentType = this.determineContentType(contentURL)

      /**
       * If content type is "song"
       */
      if (contentType === 'song') {
        try {
          this.setLoading(true)

          const isValidURL = await playDL.validate(contentURL)

          if (!isValidURL) {
            Logger.warn('Is not valid YouTube URL! - {PLAY}')
            const embeds = [createErrorEmbed('Is not valid YouTube URL!')]

            if (!message) {
              Logger.warn('No message to reply on invalid URL! - {PLAY}')
              return
            }
            message.reply({ embeds })
            return
          }

          const songInfoFromYoutube = await playDL.video_info(contentURL)

          const song = new Song(songInfoFromYoutube)

          this.addSongToQueue(song, message)

          if (!message) {
            Logger.warn(
              'There is not message to reply on song add to queue! - {PLAY}'
            )
            return
          }

          const embeds = [createLookingForSong(contentURL)]

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

          const lookingEmbeds = [createLookingForPlaylist(contentURL)]

          const textChannel = this.getTextChannel()

          textChannel.send({
            embeds: lookingEmbeds,
          })

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

          if (!message) return

          const embeds = [
            createPlaylistInfoEmbed(playlist, this.getSongQueue(), message),
          ]

          message.reply({ embeds })
        } catch (error) {
          Logger.error(
            'Failed to parse playlist and add it to the queue! - {PLAY}'
          )
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

    if (!message.guild) {
      Logger.warn('There is no message guild! - {PLAY}')
      return
    }

    const currentVoiceConnection = this.getVoiceConnection()

    if (!currentVoiceConnection) {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
      })

      this.initVoiceConnection(connection)
    }

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

    const currentPlayer = this.getPlayer()

    if (!currentPlayer) {
      this.createDiscordAudioPlayer()
    }

    const player = this.getPlayer()

    if (!player) {
      Logger.warn('There is no discord player instance! - {PLAY}')
      return
    }

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

      const song = songQueue[0]

      if (!song) {
        Logger.info('List is ended! - {PLAY}')
        return
      }

      if (!message) return

      this.playSongThroughDiscordPlayer(message, song)

      return
    })

    player.on(AudioPlayerStatus.Idle, () => {
      const songQueue = this.getSongQueue()

      if (songQueue.length === 0) {
        this.createDisconnectTimeout()
        return
      }

      const isLooped = this.getIsLooped()

      if (!isLooped) {
        this.removeSongFromQueue()
      }

      const nextSong = this.getSongQueue()[0]

      if (!nextSong) {
        Logger.info('Song queue is ended! - {PLAY}')
        return
      }

      this.playSongThroughDiscordPlayer(message, nextSong, {
        dontShowNextSong: true,
      })
    })

    voiceConnection.on(VoiceConnectionStatus.Destroyed, () => {
      Logger.warn(
        'Bot has been disconnected from voice channel - voice connection is destroyed! - {PLAY}'
      )
      this.disconnectCallback()
    })

    voiceConnection.on(VoiceConnectionStatus.Disconnected, () => {
      Logger.info('Disconnected! - {PLAY}')
      this.disconnectBotFromVoiceChannel()
      this.disconnectCallback()
    })
  }

  public skipSong(message: Message) {
    const removedSong = this.removeSongFromQueue(message)

    if (!message) {
      Logger.warn('There is not current message! - {SKIP SONG}')
      return
    }

    if (!removedSong) {
      const embeds = [createErrorEmbed('No song to skip in the queue!')]
      message.reply({ embeds })
      return
    }

    const embeds = [createSkipEmbed(removedSong, message)]
    const textChannel = this.getTextChannel()
    textChannel.send({ embeds })

    const songsQueue = this.getSongQueue()

    const songToPlay = songsQueue[0]

    if (!songToPlay) {
      Logger.info('List is ended! - {SKIP SONG}')
      return
    }

    this.playSongThroughDiscordPlayer(message, songToPlay)

    Logger.info('Skipped song! - {SKIP SONG}')
    return
  }

  public pauseSong(message: Message): void {
    if (!message) return

    const player = this.getPlayer()

    const songQueue = this.getSongQueue()

    if (songQueue.length <= 0) {
      Logger.info(
        'There is no song to pause! Song queue is empty! - {PAUSE SONG}'
      )

      const embeds = [
        createErrorEmbed('There is no song to pause! Song queue is empty!'),
      ]

      message.reply({ embeds })
      return
    }

    if (!player) {
      Logger.info('There is no player! - {PAUSE SONG}')
      return
    }

    const isPaused = player.state.status === AudioPlayerStatus.Paused

    const currentSong = songQueue[0]

    if (isPaused) {
      const embeds = [createPauseEmbed(currentSong, message, false)]
      message.reply({ embeds })
      return
    }

    const isPlayerPausedSuccessfully = player.pause()

    const textChannel = this.getTextChannel()

    if (!isPlayerPausedSuccessfully) {
      Logger.warn("Can't pause player due player error! - {PAUSE SONG}")

      const embeds = [createErrorEmbed("Can't pause player due player error!")]

      textChannel.send({ embeds })

      return
    }

    const embeds = [
      createPauseEmbed(currentSong, message, isPlayerPausedSuccessfully),
    ]

    textChannel.send({ embeds })

    return
  }

  public resumeSong(message: Message): void {
    const songQueue = this.getSongQueue()

    if (songQueue.length <= 0) {
      Logger.info(
        'There is no song to resume! Song queue is empty! - {RESUME SONG}'
      )

      const embeds = [
        createErrorEmbed('There is no song to resume! Song queue is empty!'),
      ]

      message.reply({ embeds })
      return
    }

    const player = this.getPlayer()

    if (!player) {
      Logger.warn('There is no active player! - {RESUME SONG}')
      return
    }

    const isPlaying = player.state.status === AudioPlayerStatus.Playing

    const song = songQueue[0]

    if (isPlaying) {
      const embeds = [createUnPauseEmbed(song, message, false)]
      message.reply({ embeds })
      return
    }

    const isPlayerUnpaused = player.unpause()

    if (!isPlayerUnpaused) {
      Logger.warn("Can't resume player due player error! - {RESUME SONG}")

      return
    }
    const isPaused = player.state.status === AudioPlayerStatus.Paused

    const embeds = [createUnPauseEmbed(song, message, !isPaused)]

    const textChannel = this.getTextChannel()

    textChannel.send({ embeds })

    return
  }

  public loopSong(): void {
    Logger.info('Loop enabled! - {LOOP SONG}')

    const isNowLooped = this.getIsLooped()

    const textChannel = this.getTextChannel()

    if (isNowLooped) {
      this.setIsLooped(false)
      const embeds = [createLoopEmbed(false)]
      textChannel.send({ embeds })
      return
    }

    this.setIsLooped(true)
    const embeds = [createLoopEmbed(true)]
    textChannel.send({ embeds })
    return
  }

  public getInfoAboutCurrentSong(message: Message): void {
    const songQueue = this.getSongQueue()

    const currentSong = songQueue[0]

    if (songQueue.length <= 0) {
      Logger.info(
        'Currently no song that is playing! - {GET INFO ABOUT CURRENT SONG}'
      )
      const embeds = [createErrorEmbed('Currently no song that is playing!')]
      const textChannel = this.getTextChannel()
      textChannel.send({ embeds })

      return
    }

    const embeds = [createCurrentSongEmbed(currentSong, message)]

    message.reply({ embeds })

    Logger.info('Got current song info! - {GET INFO ABOUT CURRENT SONG}')

    return
  }

  public disconnect() {
    Logger.info('Disconnected manually! - {DISCONNECT}')
    this.disconnectBotFromVoiceChannel()
    this.disconnectCallback()
  }
}

export default QueueAndPlayer
