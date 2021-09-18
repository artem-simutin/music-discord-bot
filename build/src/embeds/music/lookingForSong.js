"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLookingForSong = void 0;
const discord_js_1 = require("discord.js");
const createLookingForSong = (request) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle(':mag_right: Looking for song: ' + request)
        .setURL(request)
        .setTimestamp()
        .setFooter('Powered by DELAMAIN');
    return embed;
};
exports.createLookingForSong = createLookingForSong;
