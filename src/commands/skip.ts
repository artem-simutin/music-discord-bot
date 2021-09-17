import { createErrorEmbed } from '../embeds/error'
import { createSkipEmbed } from '../embeds/music/skipSong'
import { playSong } from '../services/playSong'
import { Command } from '../structures/command'

module.exports = new Command({
  name: 'skip',
  description: 'Skip current song',
  run: async (message, args, client) => {
    if (!message.member.voice.channel)
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to stop the music!'
          ),
        ],
      })

    const queueConstruct = client.queue.get(message.guild.id)

    if (!queueConstruct) {
      return message.reply('No music bot on chanel!')
    }

    message.channel.send({
      embeds: [createSkipEmbed(queueConstruct.songs[0], message)],
    })

    queueConstruct.songs.shift()

    if (queueConstruct.songs.length === 0) {
      queueConstruct.player.stop()
      return
    }

    playSong(queueConstruct, message)
  },
})
