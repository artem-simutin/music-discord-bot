"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorEmbed = void 0;
const discord_js_1 = require("discord.js");
const createErrorEmbed = (text) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#FF0000')
        .setTitle(':no_entry_sign: :x:  Ops! Ocurred some error! :x: :no_entry_sign:')
        .setDescription(text)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createErrorEmbed = createErrorEmbed;
