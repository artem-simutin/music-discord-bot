import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { StageChannel, TextBasedChannels, VoiceChannel } from 'discord.js';
import { Song } from './song';

export interface QueueConstructs {
  textChannel: TextBasedChannels;
  voiceChannel: VoiceChannel | StageChannel;
  connection: VoiceConnection | null;
  player: AudioPlayer | null;
  resource: AudioResource | null;
  songs: Song[];
  volume: number;
  playing: boolean;
}
