import { Event } from '../structures/event'

module.exports = new Event('ready', (client) => {
  console.log('Bot is ready!')
  client.discordClient.user?.setActivity('music! Prefix - "!!"')
})
