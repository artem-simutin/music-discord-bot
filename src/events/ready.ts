import { Event } from '../structures/event';

module.exports = new Event('ready', () => {
  console.log('Bot is ready!');
});
