"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../embeds/error");
const event_1 = require("../structures/event");
module.exports = new event_1.Event('messageCreate', (client, message) => {
    if (!message.content.startsWith(client.prefix))
        return;
    if (message.author.bot)
        return;
    const args = message.content.substring(client.prefix.length).split(/ +/);
    const command = client.commands.find((cmd) => {
        const isString = typeof cmd.name === 'string';
        return isString ? cmd.name === args[0] : cmd.name.includes(args[0]);
    });
    if (!command) {
        return message.reply({
            embeds: [(0, error_1.createErrorEmbed)(`${args[0]} is invalid bot command`)],
        });
    }
    command.run(message, args, client);
});
