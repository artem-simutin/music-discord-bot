import { createErrorEmbed } from '../embeds/error'
import { createLoopEmbed } from '../embeds/music/loop'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['repeat', 'loop'],
  description: 'Set song on infinite repeat',
  run: async (message, args, client) => {
    if (message.member && !message.member.voice.channel)
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to stop the music!'
          ),
        ],
      })

    const queueConstruct = message.guild && client.queue.get(message.guild.id)

    if (!queueConstruct) {
      return message.reply('No music bot on chanel!')
    }

    if (queueConstruct.loop) {
      queueConstruct.loop = false
      message.channel.send({ embeds: [createLoopEmbed(false)] })
    } else {
      queueConstruct.loop = true
      message.channel.send({ embeds: [createLoopEmbed(true)] })
    }

    return
  },
})
