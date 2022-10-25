import { Message } from 'discord.js'
import { createBaseEmbed } from '../../helpers/createBaseEmbed'
import { Song } from '../../structures/song'

export const createUnPauseEmbed = (
  song: Song,
  message: Message,
  isPaused: boolean = false
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = createBaseEmbed('DARK_ORANGE')
    .setTitle(isPaused ? `:pause_button:  ${song.title}` : ':open_hands:  Nope')
    .setURL(song.url)
    .setAuthor({
      name: isPaused ? 'Unpaused' : "Song hasn't paused!",
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)

  return embed
}
