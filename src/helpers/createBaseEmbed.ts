import { ColorResolvable, MessageEmbed } from 'discord.js'

const FOOTER_TEXT = 'Powered by DELAMAIN'

export const createBaseEmbed = (color: ColorResolvable) => {
  return new MessageEmbed().setColor(color).setTimestamp().setFooter({
    text: FOOTER_TEXT,
  })
}
