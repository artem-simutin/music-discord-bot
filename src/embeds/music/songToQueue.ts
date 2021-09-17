import { Message, MessageEmbed } from 'discord.js'
import { parseDuration } from '../../services/parceDuration'
import { Song } from '../../builders/song'

export const createAddSongToQueue = (
  song: Song,
  message: Message,
  songs: Song[]
) => {
  const embed = new MessageEmbed()
    .setColor('#00FF47')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('Song added to queue', message.author.avatarURL())
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
