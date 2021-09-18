"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlaylistInfoEmbed = void 0;
const discord_js_1 = require("discord.js");
const parceDuration_1 = require("../../services/parceDuration");
const createPlaylistInfoEmbed = (playlist, message) => {
    let authorImage = undefined;
    if (message && message.author && message.author.avatarURL()) {
        authorImage = message.author.avatarURL();
    }
    const seconds = playlist.items
        .map((item) => item.durationSec)
        .reduce((acc, current) => current && (acc ? acc + current : 0 + current), 0);
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#00A455')
        .setTitle(playlist.title)
        .setURL(playlist.url)
        .setAuthor('Added playlist to queue', authorImage)
        .setThumbnail(playlist.thumbnails[0].url ? playlist.thumbnails[0].url : '')
        .addFields({
        name: ':timer: Songs duration:',
        value: seconds ? (0, parceDuration_1.parseDuration)(seconds) : 'No information',
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
