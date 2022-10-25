import { Message } from 'discord.js'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'
import { Song } from '../../structures/song'

export const createPauseEmbed = (
  song: Song,
  message: Message,
  isPaused: boolean = true
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = createBaseEmbed('YELLOW')
    .setTitle(isPaused ? `:pause_button:  ${song.title}` : ':open_hands:  Nope')
    .setURL(song.url)
    .setAuthor({
      name: isPaused ? 'Paused' : 'Song has already paused!',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)

  return embed
}
