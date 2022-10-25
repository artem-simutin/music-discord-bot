import { createBaseEmbed } from '../helpers/createBaseEmbed'

export const createDisconnectEmbed = () => {
  const embed = createBaseEmbed('DARK_BUT_NOT_BLACK').setTitle(
    ':electric_plug:  Disconnected!  :electric_plug: '
  )

  return embed
}
