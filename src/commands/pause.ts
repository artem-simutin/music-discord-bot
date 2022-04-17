import { createErrorEmbed } from '../embeds/error'
import Logger from '../services/loggers'
import { Command } from '../structures/command'

module.exports = new Command({
  name: 'pause',
  description: 'Pause current song',
  run: async (message, args, client) => {
    if (message.member && !message.member.voice.channel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: PAUSE}')

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
      Logger.warn('No music bot on the channel! - {COMMAND: PAUSE}')

      message.reply('No music bot on the chanel!')

      return
    }

    queueConstruct.pauseSong(message)

    return
  },
})
