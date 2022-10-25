import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createLookingForSong = (request: string) => {
  const embed = createBaseEmbed('WHITE')
    .setTitle(':mag_right:  Looking for song: ' + request)
    .setURL(request)

  return embed
}
