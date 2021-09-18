"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: 'ping',
    description: 'Shows latency',
    run: async (message, args, client) => {
        const msg = await message.reply(`Bot responded with ${client.ws.ping} ms ping!`);
        msg.edit(`Bot responded with ${client.ws.ping} ms ping!\nMessage is delivered with ${msg.createdTimestamp - message.createdTimestamp} ms!`);
    },
});
