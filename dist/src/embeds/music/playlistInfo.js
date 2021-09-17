"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaylistInfoEmbed = void 0;
const discord_js_1 = require("discord.js");
const parceDuration_1 = require("../../services/parceDuration");
const createPlaylistInfoEmbed = (playlist, message) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#00A455')
        .setTitle(playlist.title)
        .setURL(playlist.url)
        .setAuthor('Added playlist to queue', message.author.avatarURL())
        .setThumbnail(playlist.thumbnails[0].url)
        .addFields({
        name: ':timer: Songs duration:',
        value: (0, parceDuration_1.parseDuration)(playlist.items
            .map((item) => item.durationSec)
            .reduce((acc, current) => acc + current, 0)),
        inline: true,
    }, {
        name: ':headphones: Songs count:',
        value: playlist.items.length.toString(),
        inline: true,
    })
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createPlaylistInfoEmbed = createPlaylistInfoEmbed;
