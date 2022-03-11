import * as Discord from 'discord.js'
import { Command } from './command'
import * as fs from 'fs'
import { Event } from './event'
import config from '../../config/config'
import { QueueConstructs } from '../types/queueConstruct'

type EnvType = 'production' | 'development'

const environment: EnvType = config.BUILD_MODE
  ? (config.BUILD_MODE as EnvType)
  : 'development'

const intents = new Discord.Intents(32767)

export class Client extends Discord.Client {
  commands: Discord.Collection<string, Command>
  queue: Discord.Collection<string, QueueConstructs>
  prefix: string

  constructor(options?: Discord.ClientOptions) {
    super({ ...options, intents, retryLimit: 10 })

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
          this.on(event.event, event.handler.bind(null, this))
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
          this.on(event.event, event.handler.bind(null, this))
        })
    }

    this.login(token)
  }
}
