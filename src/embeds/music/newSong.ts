import { Message, MessageEmbed } from 'discord.js'
import { parseDuration } from '../../services/parceDuration'
import { Song } from '../../builders/song'
import { formatViews } from '../../services/viewsConverter'

export const createStartPlayingEmbed = (song: Song, message: Message) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#006BA8')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('Started playing', authorImage)
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
      }
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
