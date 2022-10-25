import { Message } from 'discord.js'
import { parseDuration } from '../../services/parseDuration'
import { formatToKMB } from '../../services/formatToKMB'
import { Song } from '../../structures/song'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createAddSongToQueue = (
  song: Song,
  message: Message,
  songs: Song[]
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = createBaseEmbed('DARK_GREEN')
    .setTitle(song.title || 'No title!')
    .setURL(song.url)
    .setAuthor({
      name: 'Song added to queue',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)
    .addFields(
      {
        name: ':timer:  Song duration',
        value: parseDuration(song.length),
        inline: true,
      },
      {
        name: ':thumbsup:  Likes ',
        value: song.likes ? formatToKMB(song.likes) : 'No information',
        inline: true,
      },
      {
        name: ':eye:  Views',
        value: formatToKMB(song.views),
        inline: true,
      },
      {
        name: ':flying_disc:  Position in queue',
        value: (songs.length - 1).toString(),
        inline: true,
      },
      {
        name: ':ear:  Queue duration',
        value: parseDuration(
          songs
            .map((item) => item.length)
            .reduce((acc, current) => acc + current, 0)
        ),
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
