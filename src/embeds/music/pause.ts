import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createPauseEmbed = (
  song: Song,
  message: Message,
  isPaused: boolean = true
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#FFE895')
    .setTitle(!isPaused ? `:pause_button: ${song.title}` : ':open_hands: Nope')
    .setURL(song.url)
    .setAuthor({
      name: !isPaused ? 'Paused' : 'Song has already paused!',
      iconURL: authorImage,
    })
    .setThumbnail(song.thumbnail.url)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
