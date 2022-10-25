import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createLookingForPlaylist = (request: string) => {
  const embed = createBaseEmbed('WHITE')
    .setTitle(':mag_right:  Looking for playlist: ' + request)
    .setURL(request)

  return embed
}
