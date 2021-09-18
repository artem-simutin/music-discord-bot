"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPauseEmbed = void 0;
const discord_js_1 = require("discord.js");
const createPauseEmbed = (song, message) => {
    let authorImage = undefined;
    if (message && message.author && message.author.avatarURL()) {
        authorImage = message.author.avatarURL();
    }
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#FFE895')
        .setTitle(':pause_button: ' + song.title)
        .setURL(song.url)
        .setAuthor('Paused', authorImage)
        .setThumbnail(song.thumbnail.url)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createPauseEmbed = createPauseEmbed;
