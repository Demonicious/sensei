const { Command } = require("./../../lib/module");

class HelloCommand extends Command {
    init() {
        this.name  = "hello";
        this.alias = null;
    }

    before_run() {
        console.log('Before Run hook.');
    }

    run({ user }) {
        console.log(user);
    }

    after_run() {
        console.log('After run hook.');
    }

    on_update(message) {
        console.log('Message updated.');
    }

    on_delete(message) {
        console.log('Message deleted.');
    }
}

module.exports = HelloCommand;