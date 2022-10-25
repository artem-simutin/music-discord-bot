import { Message } from 'discord.js'

import { parseDuration } from '../../services/parseDuration'
import ytpl = require('ytpl')
import { Song } from '../../structures/song'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createPlaylistInfoEmbed = (
  playlist: ytpl.Result,
  songs: Song[],
  message: Message
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const seconds = songs
    .map((item) => item.length)
    .reduce((acc, current) => current && (acc ? acc + current : 0 + current), 0)

  const embed = createBaseEmbed('GREEN')
    .setTitle(playlist.title)
    .setURL(playlist.url)
    .setAuthor({
      name: 'Added playlist to queue',
      iconURL: authorImage,
    })
    .setThumbnail(playlist.thumbnails[0].url ? playlist.thumbnails[0].url : '')
    .addFields(
      {
        name: ':timer:  Playlist duration:',
        value: seconds ? parseDuration(seconds) : 'No information',
        inline: true,
      },
      {
        name: ':headphones:  Songs count:',
        value: songs.length.toString(),
        inline: true,
      }
    )

  return embed
}
