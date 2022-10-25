import { Message } from 'discord.js'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'
import { Song } from '../../structures/song'

export const createSkipEmbed = (song: Song, message: Message) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = createBaseEmbed('PURPLE')
    .setTitle(song.title || 'No title!')
    .setURL(song.url)
    .setAuthor({
      name: 'Skipped song',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)

  return embed
}
