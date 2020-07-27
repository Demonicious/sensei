import * as Discord from "discord.js";
import SenseiCommandInterface from "../utils/interfaces/SenseiCommandInterface";
import ArgumentInterface from "../utils/interfaces/ArgumentInterface";
import BotInfoInterface from "../utils/interfaces/BotInfoInterface";

export default class Command implements SenseiCommandInterface {
    public _client : Discord.Client;
    public _message : Discord.Message;
    public _info    : BotInfoInterface;

    name     : string              | null     | undefined;
    alias    : string              | string[] | null        | undefined;
    args     : ArgumentInterface[] | null     | undefined;
    cooldown : number              | null     | undefined;
    
    run   : Function            | null     | undefined;
    init  : Function            | null     | undefined;

    constructor(client : Discord.Client, message : Discord.Message, info : BotInfoInterface) {
        this._client = client;
        this._message = message;
        this._info    = info;

        if(this.init)
            this.init();
    }

    public message() : Discord.Message | any {
        if(this._message)
            return this._message;
        return {};
    }

    public client() : Discord.Client | any {
        if(this._client)
            return this._client;
        return {};
    }

    public author() : Discord.User | any {
        return this.message().author;
    }

    public channel() : Discord.TextChannel | Discord.DMChannel | any {
        return this.message().channel;
    }

    public info() : BotInfoInterface {
        return this._info;
    }

    public reply(sendable : any) {
        return this.message().reply(sendable);
    }

    public send(sendable : any) {
        return this.channel().send(sendable);
    }
}