"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnPauseEmbed = void 0;
const discord_js_1 = require("discord.js");
const createUnPauseEmbed = (song, message) => {
    let authorImage = undefined;
    if (message && message.author && message.author.avatarURL()) {
        authorImage = message.author.avatarURL();
    }
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#DFAE00')
        .setTitle(':pause_button: ' + song.title)
        .setURL(song.url)
        .setAuthor('Unpaused', authorImage)
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createUnPauseEmbed = createUnPauseEmbed;
