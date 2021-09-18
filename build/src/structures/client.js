"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const Discord = (0, tslib_1.__importStar)(require("discord.js"));
const fs = (0, tslib_1.__importStar)(require("fs"));
const config_1 = (0, tslib_1.__importDefault)(require("../../config/config"));
const environment = config_1.default.BUILD_MODE
    ? config_1.default.BUILD_MODE
    : 'development';
const intents = new Discord.Intents(32767);
class Client extends Discord.Client {
    constructor(options) {
        super({ ...options, intents, retryLimit: 10 });
        this.prefix = config_1.default.prefix;
        this.commands = new Discord.Collection();
        this.queue = new Discord.Collection();
    }
    start(token) {
        /**
         * If environment is development => look for TypeScript files
         */
        if (environment === 'development') {
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
        }
        else {
            /**
             * If environment is development => look for JavaScript files
             */
            fs.readdirSync('./build/src/commands')
                .filter((file) => file.endsWith('.js'))
                .forEach((file) => {
                const command = require(`../commands/${file}`);
                console.log(`Command ### ${command.name} ### loaded`);
                this.commands.set(command.name, command);
            });
            fs.readdirSync('./build/src/events')
                .filter((file) => file.endsWith('.js'))
                .forEach((file) => {
                const event = require(`../events/${file}`);
                console.log(`Event @@@ ${event.event} @@@ loaded`);
                this.on(event.event, event.handler.bind(null, this));
            });
        }
        this.login(token);
    }
}
exports.Client = Client;
