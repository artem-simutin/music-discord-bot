import playDL from 'play-dl'
import { Result as Playlist, Item } from 'ytpl'

import { Song } from '../structures/song'
import Logger from './loggers'

type ReturnResponse = {
  _failedItem?: Item
  successful: boolean
  item: Song | null
}

export type SuccessfulReturnResponse = {
  successful: true
  item: Song
}

const parsePlaylist = async (playlist: Playlist): Promise<ReturnResponse[]> => {
  Logger.info('Started parsing playlist! - {PARSE PLAYLIST}')
  const itemsToParse = playlist.items

  const promises = itemsToParse.map(async (item) => {
    try {
      const url = item.shortUrl
      const songInfoFromYoutube = await playDL.video_info(url)

      const response: ReturnResponse = {
        successful: true,
        item: new Song(songInfoFromYoutube),
      }

      return response
    } catch (error) {
      const response: ReturnResponse = {
        successful: false,
        item: null,
        _failedItem: item,
      }

      return response
    }
  })

  return Promise.all(promises).then((data) => data)
}

export default parsePlaylist
