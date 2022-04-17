// EsLint is disabled just 'cause it is type definition
/* eslint-disable no-unused-vars */
import { Message, Interaction, MessageAttachment } from 'discord.js'
import { Client } from './client'

export interface CommandOptions {
  name: string | string[]
  description: string
  run: (message: Message, args: string[], client: Client) => void
}

export class Command {
  name: string | string[]
  description: string
  run: (message: Message, args: string[], client: Client) => void

  constructor(options: CommandOptions) {
    this.name = options.name
    this.description = options.description
    this.run = options.run
  }
}
