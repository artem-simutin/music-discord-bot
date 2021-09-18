"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../embeds/error");
const unpause_1 = require("../embeds/music/unpause");
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: 'unpause',
    description: 'Unpause player',
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
        if (!queueConstruct.player) {
            message.reply({
                embeds: [(0, error_1.createErrorEmbed)("Can't unpause song. No player!")],
            });
            return;
        }
        message.channel.send({
            embeds: [(0, unpause_1.createUnPauseEmbed)(queueConstruct.songs[0], message)],
        });
        queueConstruct.player.unpause();
    },
});
