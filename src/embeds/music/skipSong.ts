import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createSkipEmbed = (song: Song, message: Message) => {
  const embed = new MessageEmbed()
    .setColor('#400072')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor('Skipped song', message.author.avatarURL())
    .setThumbnail(song.thumbnail.url)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
