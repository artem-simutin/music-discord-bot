import { creteErrorEmbed } from '../embeds/error'
import { createPauseEmbed } from '../embeds/music/pause'
import { Command } from '../structures/command'

module.exports = new Command({
  name: 'pause',
  description: 'Pause current song',
  run: async (message, args, client) => {
    if (!message.member.voice.channel)
      return message.channel.send({
        embeds: [
          creteErrorEmbed(
            'You have to be in a voice channel to stop the music!'
          ),
        ],
      })

    const queueConstruct = client.queue.get(message.guild.id)

    if (!queueConstruct) {
      return message.reply('No music bot on chanel!')
    }

    message.channel.send({
      embeds: [createPauseEmbed(queueConstruct.songs[0], message)],
    })

    queueConstruct.player.pause()
  },
})
