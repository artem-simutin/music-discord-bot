import { Command } from '../structures/command'

module.exports = new Command({
  name: 'ping',
  description: 'Shows latency',
  run: async (message, args, client) => {
    const msg = await message.reply(
      `Bot responded with ${client.discordClient.ws.ping} ms ping!`
    )
    msg.edit(
      `Bot responded with ${
        client.discordClient.ws.ping
      } ms ping!\nMessage is delivered with ${
        msg.createdTimestamp - message.createdTimestamp
      } ms!`
    )

    return
  },
})
