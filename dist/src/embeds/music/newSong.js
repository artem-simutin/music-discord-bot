"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartPlayingEmbed = void 0;
const discord_js_1 = require("discord.js");
const parceDuration_1 = require("../../services/parceDuration");
const createStartPlayingEmbed = (song, message) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#006BA8')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor('Started playing', message.author.avatarURL())
        .setThumbnail(song.thumbnail.url)
        .addFields({
        name: ':timer: Song duration',
        value: (0, parceDuration_1.parseDuration)(song.length),
        inline: true,
    }, { name: ':thumbsup: Likes ', value: song.likes.toString(), inline: true }, {
        name: ':thumbsdown: Dislikes',
        value: song.dislikes.toString(),
        inline: true,
    })
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createStartPlayingEmbed = createStartPlayingEmbed;
