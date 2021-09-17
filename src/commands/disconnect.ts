import { createDisconnectEmbed } from '../embeds/disconnect'
import { createErrorEmbed } from '../embeds/error'
import { Command } from '../structures/command'

module.exports = new Command({
  name: ['disconnect', 'dis'],
  description: 'Disconnects bot from voice channel',
  run: async (message, args, client) => {
    if (!message.member.voice.channel) {
      return message.channel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to disconnect me!'
          ),
        ],
      })
    }

    const queueConstruct = client.queue.get(message.guild.id)

    if (queueConstruct.connection) {
      queueConstruct.connection.destroy()
      client.queue.delete(message.guild.id)
      return message.channel.send({ embeds: [createDisconnectEmbed()] })
    }
  },
})
