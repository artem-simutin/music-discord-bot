"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.run = options.run;
    }
}
exports.Command = Command;
