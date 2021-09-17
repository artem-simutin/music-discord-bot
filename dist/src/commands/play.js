"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const ytpl_1 = __importDefault(require("ytpl"));
// Create queue
// const queue = new Map()
module.exports = new command_1.Command({
    name: ['play', 'p'],
    description: 'Plays song from youtube url',
    run: (message, args, client) => __awaiter(void 0, void 0, void 0, function* () {
        // Take voice chanel
        const voiceChannel = message.member.voice.channel;
        // Get server queue
        const serverQueue = client.queue.get(message.guild.id);
        // If no voice chanel found
        if (!voiceChannel)
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('You have to be in a voice channel to play the music!'),
                ],
            });
        // Get permissions
        const permissions = voiceChannel.permissionsFor(message.client.user);
        // Check, has bot needed permissions
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
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
            // Get playlist info
            pl = yield (0, ytpl_1.default)(args[1]);
        }
        else {
            // Get song info
            const songInfo = yield ytdl.getInfo(args[1]);
            // Crete song object
            song = new song_1.Song(songInfo);
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
                        // Send the message about playlist
                        queueConstruct.textChannel.send({
                            embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                        });
                        // Get links from all items and
                        const promises = pl.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                            return new song_1.Song(yield ytdl.getInfo(item.shortUrl));
                        }));
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
                // On connection try to play some song
                queueConstruct.connection.on(voice_1.VoiceConnectionStatus.Ready, () => {
                    // If it isn't playlist => send song info
                    if (!isPlaylist && song && song.title && message) {
                        queueConstruct.textChannel.send({
                            embeds: [(0, newSong_1.createStartPlayingEmbed)(song, message)],
                        });
                    }
                    // When all songs will be loaded => start playing
                    queueConstruct.loading.then((bool) => !bool && isPlaylist && (0, playSong_1.playSong)(queueConstruct, message));
                    !isPlaylist && (0, playSong_1.playSong)(queueConstruct, message);
                    /**
                     * Player idle handler
                     */
                    queueConstruct.player.on(voice_1.AudioPlayerStatus.Idle, () => {
                        if (queueConstruct.songs.length <= 1) {
                            // Set empty songs array
                            queueConstruct.songs = [];
                            // Disconnect it if bot is in idle 5 min
                            setTimeout(() => {
                                queueConstruct.connection.destroy();
                                // Clear queue
                                client.queue.delete(message.guild.id);
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
            }
            catch (error) {
                console.error(error);
                serverQueue.textChannel.send({
                    embeds: [(0, error_1.createErrorEmbed)(error.message)],
                });
            }
        }
        else {
            if (serverQueue.songs.length > 0 && isPlaylist) {
                // Send the message about playlist
                serverQueue.textChannel.send({
                    embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                });
                // Get links from all items and
                const promises = pl.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                    return new song_1.Song(yield ytdl.getInfo(item.shortUrl));
                }));
                Promise.all(promises)
                    .then((data) => {
                    serverQueue.songs = [...serverQueue.songs, ...data];
                })
                    .then(() => {
                    (0, playSong_1.playSong)(serverQueue, message);
                });
            }
            if (serverQueue.songs.length === 0 && isPlaylist) {
                if (isPlaylist) {
                    // Send the message about playlist
                    serverQueue.textChannel.send({
                        embeds: [(0, playlistInfo_1.createPlaylistInfoEmbed)(pl, message)],
                    });
                    // Get links from all items and
                    const promises = pl.items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                        return new song_1.Song(yield ytdl.getInfo(item.shortUrl));
                    }));
                    Promise.all(promises)
                        .then((data) => {
                        serverQueue.songs = [...serverQueue.songs, ...data];
                    })
                        .then(() => (0, playSong_1.playSong)(serverQueue, message));
                    return;
                }
            }
            if (serverQueue.songs.length === 0 && !isPlaylist) {
                serverQueue.songs.push(song);
                if (song && song.title && message) {
                    serverQueue.textChannel.send({
                        embeds: [(0, newSong_1.createStartPlayingEmbed)(song, message)],
                    });
                }
                (0, playSong_1.playSong)(serverQueue, message);
                return;
            }
            serverQueue.songs.push(song);
            return serverQueue.textChannel.send({
                embeds: [(0, songToQueue_1.createAddSongToQueue)(song, message, serverQueue.songs)],
            });
        }
    }),
});
