import { MessageEmbed } from 'discord.js'

export const createLookingForPlaylist = (request: string) => {
  const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(':mag_right: Looking for playlist: ' + request)
    .setURL(request)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
