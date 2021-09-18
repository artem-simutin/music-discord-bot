"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddSongToQueue = void 0;
const discord_js_1 = require("discord.js");
const parceDuration_1 = require("../../services/parceDuration");
const createAddSongToQueue = (song, message, songs) => {
    let authorImage = undefined;
    if (message && message.author && message.author.avatarURL()) {
        authorImage = message.author.avatarURL();
    }
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#00FF47')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor('Song added to queue', authorImage)
        .setThumbnail(song.thumbnail.url)
        .addFields({
        name: ':timer: Song duration',
        value: (0, parceDuration_1.parseDuration)(song.length),
        inline: true,
    }, {
        name: ':thumbsup: Likes ',
        value: song.likes ? song.likes.toString() : 'No information',
        inline: true,
    }, {
        name: ':thumbsdown: Dislikes',
        value: song.dislikes ? song.dislikes.toString() : 'No information',
        inline: true,
    }, {
        name: ':flying_disc: Position in queue',
        value: (songs.length - 1).toString(),
        inline: true,
    }, {
        name: ':ear: Queue duration',
        value: (0, parceDuration_1.parseDuration)(songs
            .map((item) => parseInt(item.length))
            .reduce((acc, current) => acc + current, 0)),
        inline: true,
    })
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createAddSongToQueue = createAddSongToQueue;
