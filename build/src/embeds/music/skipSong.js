"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSkipEmbed = void 0;
const discord_js_1 = require("discord.js");
const createSkipEmbed = (song, message) => {
    let authorImage = undefined;
    if (message && message.author && message.author.avatarURL()) {
        authorImage = message.author.avatarURL();
    }
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#400072')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor('Skipped song', authorImage)
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createSkipEmbed = createSkipEmbed;
