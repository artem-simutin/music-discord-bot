"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playSong = void 0;
const voice_1 = require("@discordjs/voice");
const error_1 = require("../embeds/error");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
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
    queueConstruct.resource.volume.setVolume(100 / queueConstruct.volume / 25);
    queueConstruct.connection.subscribe(queueConstruct.player);
    queueConstruct.player.play(queueConstruct.resource);
};
exports.playSong = playSong;
