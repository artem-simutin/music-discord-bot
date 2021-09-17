import * as Discord from 'discord.js'
import { Command } from './command'
import * as fs from 'fs'
import { Event } from '../structures/event'
import config from '../../config/config'
import { QueueConstructs } from '../types/queueConstruct'

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

  start(token) {
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

    this.login(token)
  }
}
