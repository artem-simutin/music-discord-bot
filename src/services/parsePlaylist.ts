import { Message } from 'discord.js'
import ytdl from 'ytdl-core'
import ytpl from 'ytpl'
import { Song } from '../builders/song'
import { createErrorEmbed } from '../embeds/error'
import { createPlaylistInfoEmbed } from '../embeds/music/playlistInfo'
import { QueueConstructs } from '../types/queueConstruct'

export const parsePlaylist = (
  queueConstruct: QueueConstructs,
  pl: ytpl.Result | null,
  message: Message
) => {
  const promise = new Promise<boolean>((res, rej) => {
    try {
      if (!pl) {
        console.error('No playlist')
        return
      }

      // Send the message about playlist
      queueConstruct.textChannel.send({
        embeds: [createPlaylistInfoEmbed(pl, message)],
      })

      // Get links from all items and
      const promises = pl.items.map(async (item) => {
        try {
          const trackInfo = await ytdl.getInfo(item.shortUrl)
          return new Song(trackInfo)
        } catch (error) {
          message.channel.send({
            embeds: [
              createErrorEmbed(`Cant add song to queue: ${item.title}!`),
            ],
          })

          return null
        }
      })

      // Sets songs only when all items info will be ready
      Promise.all(promises).then((data) => {
        const filteredSongs = data.filter((n) => n)

        console.log(filteredSongs)

        queueConstruct.songs = [
          ...queueConstruct.songs,
          ...(filteredSongs as Song[]),
        ]

        res(false)
      })
    } catch (error) {
      rej(true)
      console.error(error)
    }
  })

  return promise
}
