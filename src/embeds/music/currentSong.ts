import { Message, MessageEmbed } from 'discord.js'
import { parseDuration } from '../../services/parceDuration'
import { formatToKMB } from '../../services/formatToKMB'
import { Song } from '../../structures/song'

export const createCurrentSongEmbed = (song: Song, message: Message) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(song.title)
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
        name: ':eye:  Views',
        value: formatToKMB(song.views),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({
      text: 'Powered by DELAMAIN',
    })

  return embed
}
