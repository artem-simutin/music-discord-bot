"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Imports
 */
const ytdl = require('ytdl-core');
const command_1 = require("../structures/command");
const playlistInfo_1 = require("../embeds/music/playlistInfo");
const song_1 = require("../builders/song");
const voice_1 = require("@discordjs/voice");
const newSong_1 = require("../embeds/music/newSong");
const playSong_1 = require("../services/playSong");
const error_1 = require("../embeds/error");
const songToQueue_1 = require("../embeds/music/songToQueue");
const ytpl_1 = (0, tslib_1.__importDefault)(require("ytpl"));
const lookingForSong_1 = require("../embeds/music/lookingForSong");
const lookingForPlaylist_1 = require("../embeds/music/lookingForPlaylist");
let timer;
module.exports = new command_1.Command({
    name: ['play', 'p'],
    description: 'Plays song from youtube url',
    run: async (message, args, client) => {
        if (!message.member) {
            console.error('No message member');
            return;
        }
        // Take voice chanel
        const voiceChannel = message.member.voice.channel;
        if (!message.guild) {
            console.error('No message guild');
            return;
        }
        // Get server queue
        const serverQueue = client.queue.get(message.guild.id);
        // If no voice chanel found
        if (!voiceChannel)
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('You have to be in a voice channel to play the music!'),
                ],
            });
        if (!message.client.user) {
            console.error('No message client user');
            return;
        }
        // Get permissions
        const permissions = voiceChannel.permissionsFor(message.client.user);
        // Check, has bot needed permissions
        if (permissions &&
            (!permissions.has('CONNECT') || !permissions.has('SPEAK'))) {
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('I need the permissions to join and speak in your voice channel!'),
                ],
            });
        }
        const isPlaylist = args[1].search('&list=') > 0;
        let pl = null;
        let song = null;
        // Check is it playlist
        if (isPlaylist) {
            try {
                message.channel.send({ embeds: [(0, lookingForPlaylist_1.createLookingForPlaylist)(args[1])] });
                // Get playlist info
                pl = await (0, ytpl_1.default)(args[1]);
            }
            catch (error) {
                return message.reply({
                    embeds: [(0, error_1.createErrorEmbed)('No such playlist!')],
                });
            }
        }
        else {
            message.channel.send({ embeds: [(0, lookingForSong_1.createLookingForSong)(args[1])] });
            try {
                // Get song info
                const songInfo = await ytdl.getInfo(args[1]);
                // Crete song object
                song = new song_1.Song(songInfo);
            }
            catch (error) {
                return message.reply({ embeds: [(0, error_1.createErrorEmbed)('No such video!')] });
            }
        }
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                player: null,
                resource: null,
                songs: [],
                volume: 5,
                playing: true,
                loading: new Promise((res) => res(true)),
            };
            // Setting the queue using our contract
            client.queue.set(message.guild.id, queueConstruct);
            if (isPlaylist) {
                const promise = new Promise((res, rej) => {
                    try {
                        if (!pl) {
                            console.error('No playlist');
                            return;
                        }
                        // Send the message about playlist
                        queueConstruct.textChannel.send({
                            embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                        });
                        // Get links from all items and
                        const promises = pl.items.map(async (item) => {
                            return new song_1.Song(await ytdl.getInfo(item.shortUrl));
                        });
                        // Sets songs only when all items info will be ready
                        Promise.all(promises).then((data) => {
                            res(false);
                            queueConstruct.songs = [...queueConstruct.songs, ...data];
                        });
                    }
                    catch (error) {
                        rej(true);
                        console.error(error);
                    }
                });
                // Set promise for loading
                queueConstruct.loading = promise;
            }
            else {
                if (!song) {
                    return message.reply({
                        embeds: [
                            (0, error_1.createErrorEmbed)('Something went wrong while playing the song!'),
                        ],
                    });
                }
                // Pushing the song to our songs array
                queueConstruct.songs.push(song);
            }
            try {
                // Here we try to join the voice chat and save our connection into our object.
                const connection = (0, voice_1.joinVoiceChannel)({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                });
                // Set connection to queue construct
                queueConstruct.connection = connection;
                // If no player => create player
                if (!queueConstruct.player) {
                    queueConstruct.player = (0, voice_1.createAudioPlayer)();
                }
                /**
                 * On connection try to play some song
                 */
                queueConstruct.connection.on(voice_1.VoiceConnectionStatus.Ready, () => {
                    // If it isn't playlist => send song info
                    if (!isPlaylist && song && song.title && message) {
                        queueConstruct.textChannel.send({
                            embeds: [(0, newSong_1.createStartPlayingEmbed)(song, message)],
                        });
                    }
                    // When all songs will be loaded => start playing
                    queueConstruct.loading &&
                        queueConstruct.loading.then((bool) => !bool && isPlaylist && (0, playSong_1.playSong)(queueConstruct, message));
                    !isPlaylist && (0, playSong_1.playSong)(queueConstruct, message);
                    /**
                     * Player idle handler
                     */
                    if (!queueConstruct.player) {
                        message.channel.send({
                            embeds: [(0, error_1.createErrorEmbed)('No music player')],
                        });
                        return;
                    }
                    queueConstruct.player.on(voice_1.AudioPlayerStatus.Idle, () => {
                        if (queueConstruct.songs.length <= 1) {
                            // Set empty songs array
                            queueConstruct.songs = [];
                            // Disconnect it if bot is in idle 5 min
                            timer = setTimeout(() => {
                                if (queueConstruct.connection) {
                                    queueConstruct.connection.destroy();
                                }
                                if (client.queue) {
                                    // Clear queue
                                    message.guild && client.queue.delete(message.guild.id);
                                }
                                return;
                            }, 300000);
                        }
                        else {
                            // Removes first song in songs queue
                            queueConstruct.songs.shift();
                            (0, playSong_1.playSong)(queueConstruct, message);
                        }
                    });
                });
                /**
                 * On disconnect
                 */
                queueConstruct.connection.on(voice_1.VoiceConnectionStatus.Destroyed, () => {
                    // Set empty songs array
                    queueConstruct.songs = [];
                    if (client.queue) {
                        // Clear queue
                        message.guild && client.queue.delete(message.guild.id);
                    }
                    return;
                });
            }
            catch (error) {
                console.error(error);
                return;
            }
        }
        else {
            if (serverQueue.songs.length > 0 && isPlaylist) {
                if (!pl) {
                    console.error('No playlist');
                    return;
                }
                clearInterval(timer);
                // Send the message about playlist
                serverQueue.textChannel.send({
                    embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                });
                // Get links from all items and
                const promises = pl.items.map(async (item) => {
                    return new song_1.Song(await ytdl.getInfo(item.shortUrl));
                });
                Promise.all(promises)
                    .then((data) => {
                    serverQueue.songs = [...serverQueue.songs, ...data];
                })
                    .then(() => {
                    (0, playSong_1.playSong)(serverQueue, message);
                });
            }
            if (serverQueue.songs.length === 0 && isPlaylist) {
                if (!pl) {
                    console.error('No playlist');
                    return;
                }
                clearInterval(timer);
                if (isPlaylist) {
                    // Send the message about playlist
                    serverQueue.textChannel.send({
                        embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                    });
                    // Get links from all items and
                    const promises = pl.items.map(async (item) => {
                        return new song_1.Song(await ytdl.getInfo(item.shortUrl));
                    });
                    Promise.all(promises)
                        .then((data) => {
                        serverQueue.songs = [...serverQueue.songs, ...data];
                    })
                        .then(() => (0, playSong_1.playSong)(serverQueue, message));
                    return;
                }
            }
            if (!song) {
                console.error('No song');
                return;
            }
            if (serverQueue.songs.length === 0 && !isPlaylist) {
                clearInterval(timer);
                serverQueue.songs.push(song);
                if (song && song.title && message) {
                    serverQueue.textChannel.send({
                        embeds: [(0, newSong_1.createStartPlayingEmbed)(song, message)],
                    });
                }
                (0, playSong_1.playSong)(serverQueue, message);
                return;
            }
            clearInterval(timer);
            serverQueue.songs.push(song);
            return serverQueue.textChannel.send({
                embeds: [(0, songToQueue_1.createAddSongToQueue)(song, message, serverQueue.songs)],
            });
        }
    },
});
