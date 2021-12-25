import { QueueConstructs } from '../types/queueConstruct'
import { Message } from 'discord.js'
import { createAudioResource } from '@discordjs/voice'
import { createErrorEmbed } from '../embeds/error'
import ytdl from 'ytdl-core'

export const playSong = (queueConstruct: QueueConstructs, message: Message) => {
  if (queueConstruct.songs.length === 0) {
    message.channel.send({
      embeds: [createErrorEmbed('Nothing to play! :(')],
    })
  }

  queueConstruct.resource = null

  const stream = ytdl(queueConstruct.songs[0].url, {
    quality: 'highestaudio',
    filter: 'audioonly',
    highWaterMark: 1 << 25,
    liveBuffer: 40000,
  })

  if (!queueConstruct.resource) {
    queueConstruct.resource = createAudioResource(stream)
  }

  // This string is useless when `inlineVolume` is disabled in create audio resource options
  // queueConstruct.resource.volume && queueConstruct.resource.volume.setVolume(1)

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
