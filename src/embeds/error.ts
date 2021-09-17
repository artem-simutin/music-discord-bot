import { Message, MessageEmbed } from 'discord.js'

export const createErrorEmbed = (text: string) => {
  const embed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle(
      ':no_entry_sign: :x:  Ops! Ocurred some error! :x: :no_entry_sign:'
    )
    .setDescription(text)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
