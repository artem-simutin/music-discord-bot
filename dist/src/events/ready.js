"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../structures/event");
module.exports = new event_1.Event('ready', () => {
    console.log('Bot is ready!');
});
