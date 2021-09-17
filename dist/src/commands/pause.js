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
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../embeds/error");
const pause_1 = require("../embeds/music/pause");
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: 'pause',
    description: 'Pause current song',
    run: (message, args, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (!message.member.voice.channel)
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('You have to be in a voice channel to stop the music!'),
                ],
            });
        const queueConstruct = client.queue.get(message.guild.id);
        if (!queueConstruct) {
            return message.reply('No music bot on chanel!');
        }
        message.channel.send({
            embeds: [(0, pause_1.createPauseEmbed)(queueConstruct.songs[0], message)],
        });
        queueConstruct.player.pause();
    }),
});
