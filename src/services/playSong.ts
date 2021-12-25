import { QueueConstructs } from '../types/queueConstruct'
import { Message } from 'discord.js'
import { createAudioResource } from '@discordjs/voice'
import { createErrorEmbed } from '../embeds/error'
import ytdl, { downloadOptions as DownloadOptions } from 'ytdl-core'

export const playSong = (queueConstruct: QueueConstructs, message: Message) => {
  if (queueConstruct.songs.length === 0) {
    message.channel.send({
      embeds: [createErrorEmbed('Nothing to play! :(')],
    })
  }

  queueConstruct.resource = null

  const songToPlay = queueConstruct.songs[0]

  const options: DownloadOptions = songToPlay.isLive
    ? {
        highWaterMark: 1 << 25,
        liveBuffer: 40000,
      }
    : {
        quality: 'highestaudio',
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        liveBuffer: 40000,
      }

  const stream = ytdl(songToPlay.url, options)

  if (!queueConstruct.resource) {
    queueConstruct.resource = createAudioResource(stream, {
      inlineVolume: true,
    })
  }

  queueConstruct.resource.volume &&
    queueConstruct.resource.volume.setVolume(100 / queueConstruct.volume / 25)

  if (!queueConstruct.connection) {
    message.reply({
      embeds: [createErrorEmbed("I am isn't on voice channel!")],
    })
    return
  }

  if (!queueConstruct.player) {
    console.error('No player')
    return
  }

  queueConstruct.connection.subscribe(queueConstruct.player)
  queueConstruct.player.play(queueConstruct.resource)
}
