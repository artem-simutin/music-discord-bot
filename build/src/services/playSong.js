"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playSong = void 0;
const tslib_1 = require("tslib");
const voice_1 = require("@discordjs/voice");
const error_1 = require("../embeds/error");
const ytdl_core_1 = (0, tslib_1.__importDefault)(require("ytdl-core"));
const playSong = (queueConstruct, message) => {
    if (queueConstruct.songs.length === 0) {
        message.channel.send({
            embeds: [(0, error_1.createErrorEmbed)('Nothing to play! :(')],
        });
    }
    queueConstruct.resource = null;
    const stream = (0, ytdl_core_1.default)(queueConstruct.songs[0].url, {
        quality: 'highestaudio',
        filter: 'audioonly',
        highWaterMark: 1 << 25,
        liveBuffer: 40000,
    });
    if (!queueConstruct.resource) {
        queueConstruct.resource = (0, voice_1.createAudioResource)(stream, {
            inlineVolume: true,
        });
    }
    queueConstruct.resource.volume &&
        queueConstruct.resource.volume.setVolume(100 / queueConstruct.volume / 25);
    if (!queueConstruct.connection) {
        message.reply({
            embeds: [(0, error_1.createErrorEmbed)("I am isn't on voice channel!")],
        });
        return;
    }
    if (!queueConstruct.player) {
        console.error('No player');
        return;
    }
    queueConstruct.connection.subscribe(queueConstruct.player);
    queueConstruct.player.play(queueConstruct.resource);
};
exports.playSong = playSong;
