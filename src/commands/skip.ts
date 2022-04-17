import { createErrorEmbed } from '../embeds/error'
import Logger from '../services/loggers'
import { Command } from '../structures/command'

module.exports = new Command({
  name: 'skip',
  description: 'Skip current song',
  run: async (message, args, client) => {
    if (message.member && !message.member.voice.channel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: SKIP}')

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
      Logger.warn('No bot on the channel: no queue! - {COMMAND: SKIP SONG}')
      message.reply('No music bot on chanel!')
      return
    }

    queueConstruct.skipSong(message)
  },
})
