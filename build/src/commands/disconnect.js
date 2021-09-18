"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const disconnect_1 = require("../embeds/disconnect");
const error_1 = require("../embeds/error");
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: ['disconnect', 'dis'],
    description: 'Disconnects bot from voice channel',
    run: async (message, args, client) => {
        if (message.channel && message.member && !message.member.voice.channel) {
            return message.channel.send({
                embeds: [
                    (0, error_1.createErrorEmbed)('You have to be in a voice channel to disconnect me!'),
                ],
            });
        }
        const queueConstruct = message.guild && client.queue.get(message.guild.id);
        if (!queueConstruct) {
            message.channel.send({
                embeds: [(0, error_1.createErrorEmbed)('Something went wrong!')],
            });
            return;
        }
        if (queueConstruct.connection) {
            queueConstruct.connection.destroy();
            client.queue.delete(message.guild.id);
            return message.channel.send({ embeds: [(0, disconnect_1.createDisconnectEmbed)()] });
        }
    },
});
