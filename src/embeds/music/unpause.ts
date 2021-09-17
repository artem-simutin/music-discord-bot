import { Message, MessageEmbed } from 'discord.js'
import { Song } from '../../builders/song'

export const createUnPauseEmbed = (song: Song, message: Message) => {
  const embed = new MessageEmbed()
    .setColor('#DFAE00')
    .setTitle(':pause_button: ' + song.title)
    .setURL(song.url)
    .setAuthor('Unpaused', message.author.avatarURL())
    .setThumbnail(song.thumbnail.url)
    .setTimestamp()
    .setFooter('Powered by DELAMAIN')

  return embed
}
