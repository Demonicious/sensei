const { Command, ArgumentTypes } = require("./../../lib/module");

class HelloCommand extends Command {
    init() {
        this.name  = "hello";
        this.args = [
            {
                name: "user",
                type: ArgumentTypes.User,
                default: this.author()
            }
        ];
    }

    run({ user }) {
        console.log(user);
    }

    on_delete() {
        console.log('yes');
    }
}

module.exports = HelloCommand;