"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisconnectEmbed = void 0;
const discord_js_1 = require("discord.js");
const createDisconnectEmbed = () => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#000000')
        .setTitle(':electric_plug: Disconnected! :electric_plug: ')
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createDisconnectEmbed = createDisconnectEmbed;
