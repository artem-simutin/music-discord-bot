import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createLookingForPlaylist = (request: string) => {
  const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(':mag_right: Looking for playlist: ' + request)
    .setURL(request)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
