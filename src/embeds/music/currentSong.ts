import { Message } from 'discord.js'
import { parseDuration } from '../../services/parseDuration'
import { formatToKMB } from '../../services/formatToKMB'
import { Song } from '../../structures/song'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createCurrentSongEmbed = (song: Song, message: Message) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = createBaseEmbed('WHITE')
    .setTitle(song.title || 'No title!')
    .setURL(song.url)
    .setAuthor({
      name: 'Current song is',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)
    .addFields(
      {
        name: ':timer: Song duration',
        value: song.isLive ? 'Live :red_circle:' : parseDuration(song.length),
        inline: true,
      },
      {
        name: ':thumbsup: Likes ',
        value: song.likes ? formatToKMB(song.likes) : 'No information',
        inline: true,
      },
      {
        name: ':eye: Views',
        value: formatToKMB(song.views),
        inline: true,
      },
      {
        name: ':calendar_spiral: Publish date',
        value: song.publishDate || '',
        inline: true,
      }
    )

  return embed
}
