/**
 * Imports
 */
const ytdl = require('ytdl-core')
import { Command } from '../structures/command'
import { QueueConstructs } from '../types/queueConstruct'
import { Song } from '../builders/song'
import {
  AudioPlayerStatus,
  createAudioPlayer,
  joinVoiceChannel,
  VoiceConnectionStatus,
  DiscordGatewayAdapterCreator,
} from '@discordjs/voice'
import { createStartPlayingEmbed } from '../embeds/music/newSong'
import { playSong } from '../services/playSong'
import { createErrorEmbed } from '../embeds/error'
import { createAddSongToQueue } from '../embeds/music/songToQueue'
import ytpl from 'ytpl'
import { createLookingForSong } from '../embeds/music/lookingForSong'
import { createLookingForPlaylist } from '../embeds/music/lookingForPlaylist'
import { parsePlaylist } from '../services/parsePlaylist'

let timer: NodeJS.Timeout

module.exports = new Command({
  name: ['play', 'p'],
  description: 'Plays song from youtube url',
  run: async (message, args, client) => {
    if (!message.member) {
      console.error('No message member')
      return
    }

    // Take voice chanel
    const voiceChannel = message.member.voice.channel

    if (!message.guild) {
      console.error('No message guild')
      return
    }

    // Get server queue
    const serverQueue: QueueConstructs | undefined = client.queue.get(
      message.guild.id
    )

    // If no voice chanel found
    if (!voiceChannel)
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to play the music!'
          ),
        ],
      })

    if (!message.client.user) {
      console.error('No message client user')
      return
    }

    // Get permissions
    const permissions = voiceChannel.permissionsFor(message.client.user)

    // Check, has bot needed permissions
    if (
      permissions &&
      (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
    ) {
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'I need the permissions to join and speak in your voice channel!'
          ),
        ],
      })
    }

    const isPlaylist = args[1].search('&list=') > 0
    let pl: ytpl.Result | null = null
    let song: Song | null = null

    // Check is it playlist
    if (isPlaylist) {
      try {
        message.channel.send({ embeds: [createLookingForPlaylist(args[1])] })
        // Get playlist info
        pl = await ytpl(args[1])
      } catch (error) {
        return message.reply({
          embeds: [createErrorEmbed('No such playlist!')],
        })
      }
    } else {
      message.channel.send({ embeds: [createLookingForSong(args[1])] })
      try {
        // Get song info
        const songInfo = await ytdl.getInfo(args[1])

        // Crete song object
        song = new Song(songInfo)
      } catch (error) {
        return message.reply({ embeds: [createErrorEmbed('No such video!')] })
      }
    }

    if (!serverQueue) {
      const queueConstruct: QueueConstructs = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        player: null,
        resource: null,
        songs: [],
        volume: 5,
        playing: true,
        loading: new Promise((res) => res(true)),
        loop: false,
      }

      // Setting the queue using our contract
      client.queue.set(message.guild.id, queueConstruct)

      if (isPlaylist) {
        const promise = parsePlaylist(queueConstruct, pl, message)

        // Set promise for loading
        queueConstruct.loading = promise
      } else {
        if (!song) {
          return message.reply({
            embeds: [
              createErrorEmbed('Something went wrong while playing the song!'),
            ],
          })
        }
        // Pushing the song to our songs array
        queueConstruct.songs.push(song)
      }

      try {
        // Here we try to join the voice chat and save our connection into our object.
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild
            .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        })

        // Set connection to queue construct
        queueConstruct.connection = connection

        // If no player => create player
        if (!queueConstruct.player) {
          queueConstruct.player = createAudioPlayer()
        }

        /**
         * On connection try to play some song
         */
        queueConstruct.connection.on(VoiceConnectionStatus.Ready, () => {
          // If it isn't playlist => send song info
          if (!isPlaylist && song && song.title && message) {
            queueConstruct.textChannel.send({
              embeds: [createStartPlayingEmbed(song, message)],
            })
          }

          // When all songs will be loaded => start playing
          queueConstruct.loading &&
            queueConstruct.loading.then(
              (bool) => !bool && isPlaylist && playSong(queueConstruct, message)
            )

          !isPlaylist && playSong(queueConstruct, message)

          /**
           * Player idle handler
           */
          if (!queueConstruct.player) {
            message.channel.send({
              embeds: [createErrorEmbed('No music player')],
            })
            return
          }

          queueConstruct.player.on(AudioPlayerStatus.Idle, () => {
            if (queueConstruct.loop) {
              playSong(queueConstruct, message)
              return
            }

            if (queueConstruct.songs.length <= 1) {
              // Set empty songs array
              queueConstruct.songs = []

              // Disconnect it if bot is in idle 5 min
              timer = setTimeout(() => {
                if (queueConstruct.connection) {
                  queueConstruct.connection.destroy()
                }

                if (client.queue) {
                  // Clear queue
                  message.guild && client.queue.delete(message.guild.id)
                }
                return
              }, 300000)
            } else {
              // Removes first song in songs queue
              queueConstruct.songs.shift()
              playSong(queueConstruct, message)
            }
          })
        })

        /**
         * On destroy
         */
        queueConstruct.connection.on(VoiceConnectionStatus.Destroyed, () => {
          // Set empty songs array
          queueConstruct.songs = []

          if (client.queue) {
            // Clear queue
            message.guild && client.queue.delete(message.guild.id)
          }
          return
        })

        /**
         * On disconnect
         */
        queueConstruct.connection.on(VoiceConnectionStatus.Disconnected, () => {
          console.log('disconnected manually')

          // Set empty songs array
          queueConstruct.songs = []

          if (queueConstruct.connection) {
            queueConstruct.connection.destroy()
          }

          if (client.queue) {
            // Clear queue
            message.guild && client.queue.delete(message.guild.id)
          }
        })
      } catch (error) {
        console.error(error)
        return
      }
    } else {
      if (serverQueue.songs.length > 0 && isPlaylist) {
        if (!pl) {
          console.error('No playlist')
          return
        }

        clearInterval(timer)
        parsePlaylist(serverQueue, pl, message)
      }

      if (serverQueue.songs.length === 0 && isPlaylist) {
        if (!pl) {
          console.error('No playlist')
          return
        }

        clearInterval(timer)
        if (isPlaylist) {
          parsePlaylist(serverQueue, pl, message)
        }
      }

      if (!song) {
        console.error('No song')
        return
      }

      if (serverQueue.songs.length === 0 && !isPlaylist) {
        clearInterval(timer)
        serverQueue.songs.push(song)
        if (song && song.title && message) {
          serverQueue.textChannel.send({
            embeds: [createStartPlayingEmbed(song, message)],
          })
        }

        playSong(serverQueue, message)
        return
      }

      clearInterval(timer)
      serverQueue.songs.push(song)
      return serverQueue.textChannel.send({
        embeds: [createAddSongToQueue(song, message, serverQueue.songs)],
      })
    }
  },
})
