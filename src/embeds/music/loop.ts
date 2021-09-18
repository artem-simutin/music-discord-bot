import { MessageEmbed } from 'discord.js'

export const createLoopEmbed = (on: boolean) => {
  const embed = new MessageEmbed()
    .setColor('#80E8FF')
    .setTitle(on ? ':repeat_one: Looped!' : ':repeat_one: Loop is disabled!')
    .setDescription(
      on
        ? 'Now song will plays infinite times! Did you really want that?'
        : 'Now songs will switches!'
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
