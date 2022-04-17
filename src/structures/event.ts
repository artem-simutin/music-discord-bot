import * as Discord from 'discord.js'
import { Client } from './client'

// EsLint is disabled just 'cause it is type definition
// eslint-disable-next-line no-unused-vars
export type EventHandler<T = any> = (client: Client, ...eventArgs: any) => void

export class Event {
  event: keyof Discord.ClientEvents
  handler: EventHandler

  constructor(
    event: keyof Discord.ClientEvents,
    eventHandler: EventHandler<typeof event>
  ) {
    this.event = event
    this.handler = eventHandler
  }
}
