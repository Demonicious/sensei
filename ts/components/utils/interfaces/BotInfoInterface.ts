import * as Discord from "discord.js";

export default interface BotInfoInterface {
    name: string,
    theme_color:  Discord.ColorResolvable,
    secondary_color: Discord.ColorResolvable,
    danger_color: Discord.ColorResolvable,
    success_color: Discord.ColorResolvable
}