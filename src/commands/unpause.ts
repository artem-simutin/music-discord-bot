import { createErrorEmbed } from '../embeds/error'
import { Command } from '../structures/command'
import Logger from '../services/loggers'

module.exports = new Command({
  name: ['unpause', 'resume'],
  description: 'Unpause player',
  run: async (message, args, client) => {
    if (message.member && !message.member.voice.channel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: UNPAUSE}')

      message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to stop the music!'
          ),
        ],
      })
      return
    }

    const queueConstruct = message.guild && client.queue.get(message.guild.id)

    if (!queueConstruct) {
      Logger.warn('No music bot on chanel: no queue! - {COMMAND: UNPAUSE}')
      message.reply('No music bot on chanel!')
      return
    }

    queueConstruct.resumeSong(message)

    return
  },
})
