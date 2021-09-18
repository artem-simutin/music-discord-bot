import { Message, MessageEmbed } from 'discord.js'
import { parseDuration } from '../../services/parceDuration'
import { Song } from '../../builders/song'
import { formatViews } from '../../services/viewsConverter'

export const createAddSongToQueue = (
  song: Song,
  message: Message,
  songs: Song[]
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#00FF47')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('Song added to queue', authorImage)
    .setThumbnail(song.thumbnail.url)
    .addFields(
      {
        name: ':timer: Song duration',
        value: parseDuration(song.length),
        inline: true,
      },
      {
        name: ':thumbsup: Likes ',
        value: song.likes ? song.likes.toString() : 'No information',
        inline: true,
      },
      {
        name: ':thumbsdown: Dislikes',
        value: song.dislikes ? song.dislikes.toString() : 'No information',
        inline: true,
      },
      {
        name: ':eye:  Views',
        value: formatViews(song.views),
        inline: true,
      },
      {
        name: ':flying_disc: Position in queue',
        value: (songs.length - 1).toString(),
        inline: true,
      },
      {
        name: ':ear: Queue duration',
        value: parseDuration(
          songs
            .map((item) => parseInt(item.length))
            .reduce((acc, current) => acc + current, 0)
        ),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
