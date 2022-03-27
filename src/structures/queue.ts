import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice'
import { StageChannel, TextBasedChannel, VoiceChannel } from 'discord.js'

interface QueueConstructorProps {
  textChannel: TextBasedChannel
  voiceChannel: VoiceChannel | StageChannel
}

/**
 * Instance that contains songs, player and methods to control music playback
 */
class Queue {
  textChannel: TextBasedChannel
  voiceChannel: VoiceChannel | StageChannel
  voiceConnection: VoiceConnection | null
  player: AudioPlayer | null
  songs: Song[]

  constructor({ textChannel, voiceChannel }: QueueConstructorProps) {}
}

export default Queue
