import { createErrorEmbed } from '../embeds/error'
import Logger from '../services/loggers'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['current', 'now'],
  description: 'Prints the current playing song info',
  run: (message, args, client) => {
    /**
     * If user isn't on chanel
     */
    if (message.member && !message.member.voice.channel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: CURRENT}')
      message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to display song info!'
          ),
        ],
      })
      return
    }

    const queueConstruct = message.guild && client.queue.get(message.guild.id)

    if (!queueConstruct) return

    queueConstruct.getInfoAboutCurrentSong(message)
    return
  },
})
