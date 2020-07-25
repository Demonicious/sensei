const { Command } = require("./../../lib/module");

module.exports = class HelloCommand extends Command {
    init() {
        this.name  = "hello";
        this.alias = null;
        this.args  = [
            {
                name: "user",
                type: "user",
                required: true,
            }
        ]
    }

    run({ user }) {
        console.log(user);
    }
}