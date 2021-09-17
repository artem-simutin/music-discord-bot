"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnPauseEmbed = void 0;
const discord_js_1 = require("discord.js");
const createUnPauseEmbed = (song, message) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#DFAE00')
        .setTitle(':pause_button: ' + song.title)
        .setURL(song.url)
        .setAuthor('Unpaused', message.author.avatarURL())
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createUnPauseEmbed = createUnPauseEmbed;
