import { Command } from '../structures/command';
import * as ytdl from 'ytdl-core';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { Song } from '../types/song';
import { QueueConstructs } from '../types/queueConstruct';
import { playSong } from '../services/playSong';

// Create queue
const queue = new Map();

module.exports = new Command({
  name: 'play',
  description: 'Plays song from youtube url',
  run: async (message, args, client) => {
    // Take voice chanel
    const voiceChannel = message.member.voice.channel;

    // Get server queue
    const serverQueue = queue.get(message.guild.id);

    // If no voice chanel found
    if (!voiceChannel)
      return message.channel.send('You need to be in a voice channel to play music!');

    // Get permissions
    const permissions = voiceChannel.permissionsFor(message.client.user);

    // Check, has bot needed permissions
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send(
        'I need the permissions to join and speak in your voice channel!',
      );
    }

    // Get song info
    const songInfo = await ytdl.getInfo(args[1]);

    // Crete song object
    const song: Song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
      const queueConstruct: QueueConstructs = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        player: null,
        resource: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      // Setting the queue using our contract
      queue.set(message.guild.id, queueConstruct);

      // Pushing the song to our songs array
      queueConstruct.songs.push(song);

      try {
        // Here we try to join the voice chat and save our connection into our object.
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Set connection to queue construct
        queueConstruct.connection = connection;

        if (!queueConstruct.player) {
          queueConstruct.player = createAudioPlayer();
        }

        queueConstruct.connection.on(VoiceConnectionStatus.Ready, () => {
          playSong(queueConstruct, message);

          /**
           * Player idle handler
           */
          queueConstruct.player.on(AudioPlayerStatus.Idle, () => {
            if (queueConstruct.songs.length === 0) {
              console.log('Will disconnect');
              // Disconnect it if bot is in idle 5 min
              setTimeout(() => {
                queueConstruct.connection.destroy();
              }, 300000);

              return;
            }

            console.log('Shifted');
            // Removes first song
            queueConstruct.songs.shift();
            playSong(queueConstruct, message);

            // Clear queue
            queue.delete(message.guild.id);
            return;
          });
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      return message.reply(`${song.title} has been added to the queue!`);
    }
  },
});
