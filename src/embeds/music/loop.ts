import { createBaseEmbed } from '../../helpers/createBaseEmbed'

export const createLoopEmbed = (on: boolean) => {
  const embed = createBaseEmbed('BLURPLE')
    .setTitle(on ? ':repeat_one:  Looped!' : ':repeat_one:  Loop is disabled!')
    .setDescription(
      on
        ? 'Now song will plays infinite times! Did you really want that?'
        : 'Now songs will switches!'
    )

  return embed
}
