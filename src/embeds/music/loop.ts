import { MessageEmbed } from 'discord.js'

export const createLoopEmbed = () => {
  const embed = new MessageEmbed()
    .setColor('#80E8FF')
    .setTitle(':repeat_one: Looped!')
    .setDescription(
      'Now song will plays infinite times! Did you really want that?'
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
