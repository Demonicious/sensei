const { Bot } = require("./../lib/module");
const { resolve } = require("path");

const bot = new Bot();
bot.configure({
    token: "NzM0NTk4ODk2NDI4NTE1MzY5.XxUCiQ.m5qNQ1lwXE_P9PHR94yG_ktJV28",
    prefix: "af+",
    commands_directory: resolve(__dirname, 'commands')
});


bot.run();