"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Discord = __importStar(require("discord.js"));
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("../../config/config"));
const intents = new Discord.Intents(32767);
class Client extends Discord.Client {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { intents, retryLimit: 10 }));
        this.prefix = config_1.default.prefix;
        this.commands = new Discord.Collection();
        this.queue = new Discord.Collection();
    }
    start(token) {
        fs.readdirSync('./src/commands')
            .filter((file) => file.endsWith('.ts'))
            .forEach((file) => {
            const command = require(`../commands/${file}`);
            console.log(`Command ### ${command.name} ### loaded`);
            this.commands.set(command.name, command);
        });
        fs.readdirSync('./src/events')
            .filter((file) => file.endsWith('.ts'))
            .forEach((file) => {
            const event = require(`../events/${file}`);
            console.log(`Event @@@ ${event.event} @@@ loaded`);
            this.on(event.event, event.handler.bind(null, this));
        });
        this.login(token);
    }
}
exports.Client = Client;
