import { MessageEmbed } from 'discord.js'

export const createDisconnectEmbed = () => {
  const embed = new MessageEmbed()
    .setColor('#000000')
    .setTitle(':electric_plug:  Disconnected!  :electric_plug: ')
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
