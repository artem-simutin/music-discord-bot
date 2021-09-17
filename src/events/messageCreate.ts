import { Message } from 'discord.js'
import { createErrorEmbed } from '../embeds/error'
import { Event } from '../structures/event'

module.exports = new Event('messageCreate', (client, message: Message) => {
  if (!message.content.startsWith(client.prefix)) return
  if (message.author.bot) return

  const args = message.content.substring(client.prefix.length).split(/ +/)

  const command = client.commands.find((cmd) => {
    const isString = typeof cmd.name === 'string'
    return isString ? cmd.name === args[0] : cmd.name.includes(args[0])
  })

  if (!command) {
    return message.reply({
      embeds: [createErrorEmbed(`${args[0]} is invalid bot command`)],
    })
  }

  command.run(message, args, client)
})
