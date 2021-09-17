"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPauseEmbed = void 0;
const discord_js_1 = require("discord.js");
const createPauseEmbed = (song, message) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#FFE895')
        .setTitle(':pause_button: ' + song.title)
        .setURL(song.url)
        .setAuthor('Paused', message.author.avatarURL())
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createPauseEmbed = createPauseEmbed;
