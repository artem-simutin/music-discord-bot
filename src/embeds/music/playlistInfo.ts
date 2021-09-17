import { Message, MessageEmbed } from 'discord.js'

import { parseDuration } from '../../services/parceDuration'
import ytpl = require('ytpl')

export const createPlaylistInfoEmbed = (
  playlist: ytpl.Result,
  message: Message
) => {
  const embed = new MessageEmbed()
    .setColor('#00A455')
    .setTitle(playlist.title)
    .setURL(playlist.url)
    .setAuthor('Added playlist to queue', message.author.avatarURL())
    .setThumbnail(playlist.thumbnails[0].url)
    .addFields(
      {
        name: ':timer: Songs duration:',
        value: parseDuration(
          playlist.items
            .map((item) => item.durationSec)
            .reduce((acc, current) => acc + current, 0)
        ),
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
