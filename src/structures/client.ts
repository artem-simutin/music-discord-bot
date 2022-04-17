import * as Discord from 'discord.js'
import { Command } from './command'
import * as fs from 'fs'
import { Event } from './event'
import config from '../../config/config'
import QueueAndPlayer from './queue'

const environment = config.BUILD_MODE ? config.BUILD_MODE : 'development'

const intents = new Discord.Intents(32767)

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
          console.log(`Command ### ${command.name} ### loaded`)
          this.commands.set(command.name, command)
        })

      fs.readdirSync('./src/events')
        .filter((file) => file.endsWith('.ts'))
        .forEach((file) => {
          const event: Event = require(`../events/${file}`)
          console.log(`Event @@@ ${event.event} @@@ loaded`)
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
          console.log(`Command ### ${command.name} ### loaded`)
          this.commands.set(command.name, command)
        })

      fs.readdirSync('./build/src/events')
        .filter((file) => file.endsWith('.js'))
        .forEach((file) => {
          const event: Event = require(`../events/${file}`)
          console.log(`Event @@@ ${event.event} @@@ loaded`)
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
