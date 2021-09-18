"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../embeds/error");
const skipSong_1 = require("../embeds/music/skipSong");
const playSong_1 = require("../services/playSong");
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: 'skip',
    description: 'Skip current song',
    run: async (message, args, client) => {
        if (message.member && !message.member.voice.channel)
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('You have to be in a voice channel to stop the music!'),
                ],
            });
        const queueConstruct = message.guild && client.queue.get(message.guild.id);
        if (!queueConstruct) {
            return message.reply('No music bot on chanel!');
        }
        message.channel.send({
            embeds: [(0, skipSong_1.createSkipEmbed)(queueConstruct.songs[0], message)],
        });
        queueConstruct.songs.shift();
        if (!queueConstruct.player) {
            message.reply({
                embeds: [(0, error_1.createErrorEmbed)("Can't skip song. No player!")],
            });
            return;
        }
        if (queueConstruct.songs.length === 0) {
            queueConstruct.player.stop();
            return;
        }
        (0, playSong_1.playSong)(queueConstruct, message);
    },
});
