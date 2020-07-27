const { MessageEmbed } = require("discord.js");
const { Command } = require("./../../lib/module");

module.exports = class AvatarCommand extends Command {
    init() {
        this.name = "avatar";
        this.alias = [
            'pfp',
            'profile_pic',
            'av'
        ];

        this.args = [
            {
                name: "user",
                type: "user",
                default: this.author()
            }
        ]
    }

    run({ user }) {
        const info   = this.info();
        const client = this.client();

        const embed = new MessageEmbed();
        embed.setAuthor("User Avatar", client.user.avatarURL());
        embed.setDescription(`Here's the avatar you were looking for.`);
        embed.setImage(user.avatarURL());
        embed.setColor(info.theme_color);
        embed.setFooter(info.name);
        embed.setTimestamp();


        return this.send(embed);
    }
}