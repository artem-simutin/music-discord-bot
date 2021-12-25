import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createSkipEmbed = (song: Song, message: Message) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#400072')
    .setTitle(song.title)
    .setURL(song.url)
    .setAuthor({
      name: 'Skipped song',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
