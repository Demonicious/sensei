require('dotenv').config(); // Loading our .env file containing the Token.

const { Bot } = require("./../lib/module");
const { resolve } = require("path");

const bot = new Bot();
bot.configure({
    token: process.env.TOKEN,
    prefix: "af+",
    commands_directory: resolve(__dirname, 'commands'),
    report_errors: true,
    report_not_found: true,
    info: {
        name: "AnimeFrost",
    }
});


bot.run();