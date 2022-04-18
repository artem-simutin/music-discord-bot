import * as Discord from 'discord.js'
import { Command } from './command'
import * as fs from 'fs'
import { Event } from './event'
import config from '../../config/config'
import QueueAndPlayer from './queue'
import Logger from '../services/loggers'

const environment = config.BUILD_MODE ? config.BUILD_MODE : 'development'

const intents = new Discord.Intents([
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
])

/**
 * Main bot instance that contains all instances to control bot
 */
export class Client {
  discordClient: Discord.Client
  commands: Discord.Collection<string, Command>
  queue: Discord.Collection<string, QueueAndPlayer>
  prefix: string

  constructor(options?: Discord.ClientOptions) {
    this.discordClient = new Discord.Client({
      ...options,
      intents,
      retryLimit: 10,
      partials: ['CHANNEL', 'MESSAGE'],
    })
    this.prefix = config.prefix
    this.commands = new Discord.Collection()
    this.queue = new Discord.Collection()
  }

  start(token: string) {
    /**
     * If environment is development => look for TypeScript files
     */
    if (environment === 'development') {
      fs.readdirSync('./src/commands')
        .filter((file) => file.endsWith('.ts'))
        .forEach((file) => {
          const command = require(`../commands/${file}`)
          Logger.command(command.name)
          this.commands.set(command.name, command)
        })

      fs.readdirSync('./src/events')
        .filter((file) => file.endsWith('.ts'))
        .forEach((file) => {
          const event: Event = require(`../events/${file}`)
          Logger.event(event.event)
          this.discordClient.on(event.event, event.handler.bind(null, this))
        })
    } else {
      /**
       * If environment is development => look for JavaScript files
       */
      fs.readdirSync('./build/src/commands')
        .filter((file) => file.endsWith('.js'))
        .forEach((file) => {
          const command = require(`../commands/${file}`)
          Logger.command(command.name)
          this.commands.set(command.name, command)
        })

      fs.readdirSync('./build/src/events')
        .filter((file) => file.endsWith('.js'))
        .forEach((file) => {
          const event: Event = require(`../events/${file}`)
          Logger.event(event.event)
          this.discordClient.on(event.event, event.handler.bind(null, this))
        })
    }

    this.discordClient.login(token)
  }

  getQueue(id: string) {
    if (!this.queue) return null
    return this.queue.get(id)
  }

  setQueue(id: string, queue: QueueAndPlayer) {
    this.queue.set(id, queue)
  }

  removeQueue(id: string) {
    this.queue.delete(id)
  }
}
