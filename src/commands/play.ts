/**
 * Imports
 */
import { Command } from '../structures/command'
import { createErrorEmbed } from '../embeds/error'
import Logger from '../services/loggers'
import QueueAndPlayer from '../structures/queue'

module.exports = new Command({
  name: ['play', 'p'],
  description: 'Plays song from youtube url',
  run: async (message, args, client) => {
    if (!message.member) {
      Logger.warn('No message member - {COMMAND: PLAY}')
      return
    }

    // Take voice chanel
    const voiceChannel = message.member.voice.channel

    // Take text channel
    const textChannel = message.channel

    if (!message.guild) {
      console.error('No message guild')
      return
    }

    // Message guild ID
    const messageGuildID = message.guild.id

    // If no voice chanel found
    if (!voiceChannel) {
      Logger.warn('User is not on the voice channel! - {COMMAND: PLAY}')

      textChannel.send({
        embeds: [
          createErrorEmbed(
            'You have to be in a voice channel to play the music!'
          ),
        ],
      })
      return
    }

    if (!message.client.user) {
      Logger.warn('No message client user')
      return
    }

    // Get permissions
    const permissions = voiceChannel.permissionsFor(message.client.user)

    // Check, has bot needed permissions
    if (
      permissions &&
      (!permissions.has('CONNECT') || !permissions.has('SPEAK'))
    ) {
      textChannel.send({
        embeds: [
          createErrorEmbed(
            'I need the permissions to join and speak in your voice channel!'
          ),
        ],
      })
      return
    }

    // Get queue from client
    const queueConstruction = client.getQueue(messageGuildID)

    if (!queueConstruction) {
      const disconnectCallback = () => {
        client.removeQueue(messageGuildID)
      }

      const queue = new QueueAndPlayer({
        disconnectCallback,
        textChannel,
        voiceChannel,
      })

      client.setQueue(messageGuildID, queue)

      const newQueue = client.getQueue(messageGuildID)

      newQueue?.play(message, {
        args,
      })
    }

    queueConstruction?.play(message, {
      args,
    })

    return
  },
})
