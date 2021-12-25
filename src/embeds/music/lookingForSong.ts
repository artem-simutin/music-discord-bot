import { MessageEmbed } from 'discord.js'

export const createLookingForSong = (request: string) => {
  const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(':mag_right:  Looking for song: ' + request)
    .setURL(request)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
