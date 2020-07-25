import * as Discord from "discord.js";
import SenseiCommandInterface from "../utils/interfaces/SenseiCommandInterface";
import ArgumentInterface from "../utils/interfaces/ArgumentInterface";

export default class Command implements SenseiCommandInterface {
    protected client : Discord.Client;
    protected message : Discord.Message;

    name  : string              | null     | undefined;
    alias : string              | string[] | null        | undefined;
    args  : ArgumentInterface[] | null     | undefined;
    
    run   : Function            | null     | undefined;
    init  : Function            | null     | undefined;

    constructor(client : Discord.Client, message : Discord.Message) {
        this.client = client;
        this.message = message;

        this.name  = null;
        this.alias = null;
        this.args  = null;

        if(this.init)
            this.init();
    }
}