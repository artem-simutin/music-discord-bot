import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice'
import { StageChannel, TextBasedChannel, VoiceChannel } from 'discord.js'
import { Song } from '../builders/song'
export interface QueueConstructs {
  textChannel: TextBasedChannel
  voiceChannel: VoiceChannel | StageChannel
  connection: VoiceConnection | null
  player: AudioPlayer | null
  resource: AudioResource | null
  songs: Song[]
  volume: number
  playing: boolean
  loading?: Promise<boolean>
  loop: boolean
}
