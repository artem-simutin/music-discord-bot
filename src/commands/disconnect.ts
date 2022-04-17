import { createErrorEmbed } from '../embeds/error'
import Logger from '../services/loggers'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['disconnect', 'dis'],
  description: 'Disconnects bot from voice channel',
  run: async (message, args, client) => {
    if (message.channel && message.member && !message.member.voice.channel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: DISCONNECT}')

      message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to disconnect me!'
          ),
        ],
      })
      return
    }

    const queueConstruct = message.guild && client.queue.get(message.guild.id)

    if (!queueConstruct) {
      Logger.warn(
        'There is not queue construction to disconnect bot! - {COMMAND: DISCONNECT}'
      )

      message.channel.send({
        embeds: [createErrorEmbed('Something went wrong!')],
      })
      return
    }

    queueConstruct.disconnect()
  },
})
