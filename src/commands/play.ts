/**
 * Imports
 */
import { Command } from '../structures/command'
import * as ytdl from 'ytdl-core'
import { QueueConstructs } from '../types/queueConstruct'
import * as ytpl from 'ytpl'
import { createPlaylistInfoEmbed } from '../embeds/music/playlistInfo'
import { Song } from '../builders/song'
import {
  AudioPlayerStatus,
  createAudioPlayer,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import { createStartPlayingEmbed } from '../embeds/music/newSong'
import { playSong } from '../services/playSong'
import { creteErrorEmbed } from '../embeds/error'
import { createAddSongToQueue } from '../embeds/music/songToQueue'

// Create queue
// const queue = new Map()

module.exports = new Command({
  name: ['play', 'p'],
  description: 'Plays song from youtube url',
  run: async (message, args, client) => {
    // Take voice chanel
    const voiceChannel = message.member.voice.channel

    // Get server queue
    const serverQueue: QueueConstructs = client.queue.get(message.guild.id)

    // If no voice chanel found
    if (!voiceChannel)
      return message.channel.send({
        embeds: [
          creteErrorEmbed(
            'You have to be in a voice channel to play the music!'
          ),
        ],
      })

    // Get permissions
    const permissions = voiceChannel.permissionsFor(message.client.user)

    // Check, has bot needed permissions
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send({
        embeds: [
          creteErrorEmbed(
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
      // Get playlist info
      pl = await ytpl(args[1])
    } else {
      // Get song info
      const songInfo = await ytdl.getInfo(args[1])

      // Crete song object
      song = new Song(songInfo)
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
      }

      // Setting the queue using our contract
      client.queue.set(message.guild.id, queueConstruct)

      if (isPlaylist) {
        const promise = new Promise<boolean>((res, rej) => {
          try {
            // Send the message about playlist
            queueConstruct.textChannel.send({
              embeds: [createPlaylistInfoEmbed(pl, message)],
            })

            // Get links from all items and
            const promises = pl.items.map(async (item) => {
              return new Song(await ytdl.getInfo(item.shortUrl))
            })

            // Sets songs only when all items info will be ready
            Promise.all(promises).then((data) => {
              res(false)
              queueConstruct.songs = [...queueConstruct.songs, ...data]
            })
          } catch (error) {
            rej(true)
            console.error(error)
          }
        })

        // Set promise for loading
        queueConstruct.loading = promise
      } else {
        // Pushing the song to our songs array
        queueConstruct.songs.push(song)
      }

      try {
        // Here we try to join the voice chat and save our connection into our object.
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        })

        // Set connection to queue construct
        queueConstruct.connection = connection

        // If no player => create player
        if (!queueConstruct.player) {
          queueConstruct.player = createAudioPlayer()
        }

        // On connection try to play some song
        queueConstruct.connection.on(VoiceConnectionStatus.Ready, () => {
          // If it isn't playlist => send song info
          if (!isPlaylist) {
            queueConstruct.textChannel.send({
              embeds: [createStartPlayingEmbed(song, message)],
            })
          }

          // When all songs will be loaded => start playing
          queueConstruct.loading.then(
            (bool) => !bool && isPlaylist && playSong(queueConstruct, message)
          )

          !isPlaylist && playSong(queueConstruct, message)

          /**
           * Player idle handler
           */
          queueConstruct.player.on(AudioPlayerStatus.Idle, () => {
            if (queueConstruct.songs.length <= 1) {
              console.log('will disconnect')

              // Set empty songs array
              queueConstruct.songs = []

              // Disconnect it if bot is in idle 5 min
              setTimeout(() => {
                queueConstruct.connection.destroy()
                // Clear queue
                client.queue.delete(message.guild.id)
                return
              }, 300000)
            } else {
              // Removes first song in songs queue
              queueConstruct.songs.shift()
              playSong(queueConstruct, message)
            }
          })
        })
      } catch (error) {
        console.error(error)
        serverQueue.textChannel.send({
          embeds: [creteErrorEmbed(error.message)],
        })
      }
    } else {
      if (isPlaylist) {
        // Send the message about playlist
        serverQueue.textChannel.send({
          embeds: [createPlaylistInfoEmbed(pl, message)],
        })

        // Get links from all items and
        const promises = pl.items.map(async (item) => {
          return new Song(await ytdl.getInfo(item.shortUrl))
        })

        Promise.all(promises).then((data) => {
          serverQueue.songs = [...serverQueue.songs, ...data]
        })
      }

      if (serverQueue.songs.length === 0) {
        serverQueue.songs.push(song)
        serverQueue.textChannel.send({
          embeds: [createStartPlayingEmbed(song, message)],
        })
        console.log('Going next')
        playSong(serverQueue, message)
        return
      }

      serverQueue.songs.push(song)
      return serverQueue.textChannel.send({
        embeds: [createAddSongToQueue(song, message, serverQueue.songs)],
      })
    }
  },
})
