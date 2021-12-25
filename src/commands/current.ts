import { createErrorEmbed } from '../embeds/error'
import { createCurrentSongEmbed } from '../embeds/music/currentSong'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['current', 'now'],
  description: 'Prints the current playing song info',
  run: (message, args, client) => {
    /**
     * If user isn't on chanel
     */
    if (message.member && !message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to display song info!'
          ),
        ],
      })
    }

    const queueConstruct = message.guild && client.queue.get(message.guild.id)

    if (!queueConstruct) return

    /**
     * If no songs in playback
     */
    if (queueConstruct?.songs.length === 0) {
      return message.channel.send({
        embeds: [createErrorEmbed('No playing song!')],
      })
    }

    return message.channel.send({
      embeds: [createCurrentSongEmbed(queueConstruct.songs[0], message)],
    })
  },
})
