import { createErrorEmbed } from '../embeds/error'
import { createPauseEmbed } from '../embeds/music/pause'
import { createUnPauseEmbed } from '../embeds/music/unpause'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['unpause', 'resume'],
  description: 'Unpause player',
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

    if (!queueConstruct.player) {
      message.reply({
        embeds: [createErrorEmbed("Can't unpause song. No player!")],
      })
      return
    }

    message.channel.send({
      embeds: [createUnPauseEmbed(queueConstruct.songs[0], message)],
    })

    queueConstruct.player.unpause()
  },
})
