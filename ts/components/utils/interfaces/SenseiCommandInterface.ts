import ArgumentInterface from "./ArgumentInterface";
import { Message, Client } from "discord.js";
import BotInfoInterface from "./BotInfoInterface";

export default interface SenseiCommandInterface {
    name     : string              | null     | undefined,
    alias    : string              | string[] | null       | undefined,
    args     : ArgumentInterface[] | null     | undefined,
    cooldown : number              | null     | undefined,

    run      : Function            | null     | undefined,
    before_run : Function | null | undefined,
    after_run  : Function | null | undefined,
    on_update  : Function | null | undefined,
    on_delete  : Function | null | undefined,

    init     : Function            | null     | undefined,

    _message : Message,
    _client  : Client,
    _info    : BotInfoInterface

    message : Function,
    info    : Function,
    author  : Function,
    client  : Function,
    reply   : Function,
    send    : Function,
    channel : Function,
}