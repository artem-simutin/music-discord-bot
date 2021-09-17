"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSkipEmbed = void 0;
const discord_js_1 = require("discord.js");
const createSkipEmbed = (song, message) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#400072')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor('Skipped song', message.author.avatarURL())
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createSkipEmbed = createSkipEmbed;
