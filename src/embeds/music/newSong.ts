import { Message, MessageEmbed } from 'discord.js'
import { parseDuration } from '../../services/parceDuration'
import { Song } from '../../builders/song'

export const createStartPlayingEmbed = (song: Song, message: Message) => {
  const embed = new MessageEmbed()
    .setColor('#006BA8')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('Started playing', message.author.avatarURL())
    .setThumbnail(song.thumbnail.url)
    .addFields(
      {
        name: ':timer: Song duration',
        value: parseDuration(song.length),
        inline: true,
      },
      { name: ':thumbsup: Likes ', value: song.likes.toString(), inline: true },
      {
        name: ':thumbsdown: Dislikes',
        value: song.dislikes.toString(),
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
