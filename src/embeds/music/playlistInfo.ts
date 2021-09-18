import { Message, MessageEmbed } from 'discord.js'

import { parseDuration } from '../../services/parceDuration'
import ytpl = require('ytpl')

export const createPlaylistInfoEmbed = (
  playlist: ytpl.Result,
  message: Message
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const seconds = playlist.items
    .map((item) => item.durationSec)
    .reduce((acc, current) => current && (acc ? acc + current : 0 + current), 0)

  const embed = new MessageEmbed()
    .setColor('#00A455')
    .setTitle(playlist.title)
    .setURL(playlist.url)
    .setAuthor('Added playlist to queue', authorImage)
    .setThumbnail(playlist.thumbnails[0].url ? playlist.thumbnails[0].url : '')
    .addFields(
      {
        name: ':timer: Songs duration:',
        value: seconds ? parseDuration(seconds) : 'No information',
        inline: true,
      },
      {
        name: ':headphones: Songs count:',
        value: playlist.items.length.toString(),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
