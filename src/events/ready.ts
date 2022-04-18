import Logger from '../services/loggers'
import { Event } from '../structures/event'

module.exports = new Event('ready', (client) => {
  Logger.connected()
  client.discordClient.user?.setActivity('music! Prefix - "!!"')
})
