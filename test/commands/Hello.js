const { Command } = require("./../../lib/module");

module.exports = class HelloCommand extends Command {
    init() {
        this.name  = "hello";
        this.alias = null;
        this.args = [
            {
                name: "user",
                type: "USER",
            },
            {
                name: "message",
                type: "STRING"
            }
        ]
    }

    run({ user, message }) {
        console.log(user);
        console.log(message);
    }
}