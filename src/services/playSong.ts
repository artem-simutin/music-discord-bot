import { QueueConstructs } from '../types/queueConstruct';
import * as ytdl from 'ytdl-core';
import { Message } from 'discord.js';
import { createAudioResource } from '@discordjs/voice';

export const playSong = (queueConstruct: QueueConstructs, message: Message) => {
  if (queueConstruct.songs.length === 0) {
    message.reply('Nothing to play! :(');
  }

  queueConstruct.resource = null;

  const stream = ytdl(queueConstruct.songs[0].url, {
    quality: 'highestaudio',
    filter: 'audioonly',
  });

  if (!queueConstruct.resource) {
    queueConstruct.resource = createAudioResource(stream, { inlineVolume: true });
  }

  queueConstruct.resource.volume.setVolume(100 / queueConstruct.volume / 25);

  message.reply(`Start playing - **${queueConstruct.songs[0].title}**`);

  queueConstruct.connection.subscribe(queueConstruct.player);
  queueConstruct.player.play(queueConstruct.resource);
};
