import { Message } from 'discord.js';
import { Event } from '../structures/event';

module.exports = new Event('messageCreate', (client, message: Message) => {
  if (!message.content.startsWith(client.prefix)) return;
  if (message.author.bot) return;

  const args = message.content.substring(client.prefix.length).split(/ +/);

  const command = client.commands.find((cmd) => cmd.name === args[0]);

  if (!command) message.reply(`${command.name} is invalid bot command`);

  command.run(message, args, client);
});
