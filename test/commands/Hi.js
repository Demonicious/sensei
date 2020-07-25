const { Command } = require("./../../lib/module");

module.exports = class HiCommand extends Command {
    init() {
        this.name = "hi";
        this.alias = ["hello2", "hello3"];
    }

    run() {
        console.log('YOOOOOOOOOOOOOO');
    }
}