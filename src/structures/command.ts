import { Message, Interaction } from 'discord.js'
import { Client } from './client'

export interface CommandOptions {
  name: string | string[]
  description: string
  run: (message: Message, args: string[], client: Client) => void
}

export class Command {
  name: string | string[]
  description: string
  run: (message: Message | Interaction, args: string[], client: Client) => void

  constructor(options: CommandOptions) {
    this.name = options.name
    this.description = options.description
    this.run = options.run
  }
}
