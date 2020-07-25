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
            }
        ]
    }

    run({ user }) {
        const embed = new MessageEmbed();
        embed.setAuthor("User Avatar", this.client.user.avatarURL());
        embed.setDescription(`Here's the avatar you were looking for.`);
        embed.setImage(user.avatarURL());
        embed.setColor(this.info.theme_color);
        embed.setFooter(this.info.name);
        embed.setTimestamp();


        return this.message.channel.send(embed);
    }
}