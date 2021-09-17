"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../structures/command");
module.exports = new command_1.Command({
    name: 'ping',
    description: 'Shows latency',
    run: (message, args, client) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield message.reply(`Bot responded with ${client.ws.ping} ms ping!`);
        msg.edit(`Bot responded with ${client.ws.ping} ms ping!\nMessage is delivered with ${msg.createdTimestamp - message.createdTimestamp} ms!`);
    }),
});
