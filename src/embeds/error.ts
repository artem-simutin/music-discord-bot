import { createBaseEmbed } from '../helpers/createBaseEmbed'

export const createErrorEmbed = (text: string, description?: string) => {
  const embed = createBaseEmbed('RED')
    .setTitle(
      ':no_entry_sign: :x:  Ops! Ocurred some error!  :x: :no_entry_sign:'
    )
    .setDescription(text)
    .setFields(
      description
        ? [
            {
              name: 'Error details',
              value: description,
            },
          ]
        : []
    )

  return embed
}
