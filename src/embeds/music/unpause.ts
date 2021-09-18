import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createUnPauseEmbed = (
  song: Song,
  message: Message,
  isPaused: boolean = true
) => {
  let authorImage: string | undefined = undefined

  if (message && message.author && message.author.avatarURL()) {
    authorImage = message.author.avatarURL() as string
  }

  const embed = new MessageEmbed()
    .setColor('#DFAE00')
    .setTitle(isPaused ? `:pause_button: ${song.title}` : ':open_hands: Nope')
    .setURL(song.url)
    .setAuthor(isPaused ? 'Unpaused' : "Song hasn't paused!", authorImage)
    .setThumbnail(song.thumbnail.url)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
