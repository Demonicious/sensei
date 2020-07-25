import { resolve } from "path";
import { readdirSync, } from "fs";

import * as Discord from "discord.js";
import Log from "./Log";

import ConfigInterface from "../utils/interfaces/ConfigInterface";
import CommandInterface from "../utils/interfaces/CommandInterface";
import CallableInterface from "../utils/interfaces/CallableInterface";
import SenseiCommandInterface from "../utils/interfaces/SenseiCommandInterface";
import ArgumentInterface from "../utils/interfaces/ArgumentInterface";

import trim_char from "./../utils/helpers/trim_char";
import command_parser from "./../utils/helpers/command_parser";

export default class Bot {
    private client : Discord.Client;

    private prefix : string | string[] = 'af+';
    private commands_directory : string = "./commands";
    private token : string = "";
    private commands : any[] = [];

    constructor(config: null | ConfigInterface) {
        this.client = new Discord.Client();
        Log.Info('A new client was created.');
        if(config) {
            this.configure(config);
        }
    }

    public configure(config : ConfigInterface) : Bot {
        this.prefix               = config.prefix;
        this.token                = config.token;
        this.commands_directory   = config.commands_directory;

        Log.Success('Configured Successfully.');
        return this;
    }

    public set set_prefix(prefix : string | string[]) {
        this.prefix = prefix;
        Log.Success('Prefix set successfully.');
    }
    
    public set set_commands_directory(commands_directory : string) {
        this.commands_directory = commands_directory;
        Log.Success('Commands Directory set successfully.');
    }

    public set set_token(token : string) {
        this.token = token;
        Log.Success('Token set successfully.');
    }

    private _pre_process() {
        this._setup_prefix();
        this._load_commands();
        this._system_events();
    }

    private _setup_prefix() {
        this.prefix = (this.prefix instanceof Array) ? this.prefix.map(p => p.trim().toLowerCase()) : this.prefix.trim().toLowerCase();
        Log.Progress('Prefixes Setup', 30);
    }

    private _load_commands() {
        let files : string[] = readdirSync(this.commands_directory);
        this.commands = files.map(file => {
            if(!file.startsWith('_')) {
                if(file.endsWith('.js')) {
                    let construct = (require(resolve(this.commands_directory, file)));
                    return {
                        instance: new construct(),
                        construct: construct
                    }
                }
            }

            return null
        }).filter(command => command);

        Log.Progress('Commands Setup', 45);
    }

    private _system_events() {
        this.client.on("message", this._handle_message.bind(this));

        Log.Progress('System Events Setup', 85);
    }

    private _handle_message(message : Discord.Message) {
        if(message.author.bot) return;
        message.content = message.content.trim();

        let subject = message.content.toLowerCase().replace(/\s+/g, '|');
        let is_command : boolean = false;
        let selected_prefix : string | null | any = null;

        if(this.prefix instanceof Array) {
            for(let i = 0; i < this.prefix.length; i++) {
                let prefix = this.prefix[i];
                if(subject.startsWith(prefix)) {
                    selected_prefix = prefix;
                    is_command = true;
                    break;
                }
            }
        } else if(subject.startsWith(this.prefix)) {
            selected_prefix = this.prefix;
            is_command = true;
        }

        if(is_command) {
            subject = trim_char(subject.replace(selected_prefix, ''), '|');
            let command : any= this._determine_command.bind(this)(subject);
            if(command) {
                subject = command.subject;
                let construct : any = command.construct;
                let instance : SenseiCommandInterface = command.instance;
                if(instance.args) {
                    const [args, result] : any = this._determine_arguments.bind(this)(instance.args, subject, message);
                    if(result) {
                        let new_instance : any = new construct();
                        return new_instance.run({...args});
                    } else {
                        switch(args) {
                            case "INSUFFICIENT":
                                Log.Danger('Insufficient Arguments.');
                            break;
                            case "NOT_A_NUMBER":
                                Log.Danger('Argument must be a Number.');
                            break;
                            case "NOT_A_WORD":
                                Log.Danger('Argument must be an Alphanumeric Word.');
                            break;
                            case "NOT_A_USER":
                                Log.Danger('Argument must be a User Mention.');
                            break;
                            case "NOT_A_ROLE":
                                Log.Danger('Argument must be a Role Mention.');
                            break;
                            case "NOT_A_CHANNEL":
                                Log.Danger('Argument must be a Channel Mention.');
                            break;
                            case "STRING_ONLY_LAST":
                                Log.Danger('Only the final argumnet may be a string.');
                            break;
                        }
                    }
                } else {
                    let new_instance : any = new construct(this.client, message);
                    return new_instance.run();
                }
            }
        }
    }

    private _determine_arguments(args : ArgumentInterface[], subject : string, message : Discord.Message) : any {
        if(args.length) {

            let u_index = 0;
            let r_index = 0;
            let c_index = 0;
    
            let users = message.mentions.users.array();
            let roles = message.mentions.roles.array();
            let channels = message.mentions.channels.array();

            let all_input : string | string[] = subject.trim();
            if(all_input.includes('|'))
                all_input = all_input.split('|');
            else all_input = [all_input];

            if(all_input instanceof Array && args.length > all_input.length) {
                return ['INSUFFICIENT', false];
            }

            let user_args : any = {};

            for(let i = 0; i < args.length; i++) {
                let arg : ArgumentInterface = args[i];
                let input = all_input[i];

                let name = arg.name;
                if(input && input != '') {
                    let res : any = null;

                    switch(arg.type.toLowerCase()) {
                        case "number":
                            res = command_parser.number(input);
                            if(res) {
                                user_args[name] = res.value;
                            } else {
                                return ["NOT_A_NUMBER", false];
                            }
                        break;
                        case "word":
                            res = command_parser.word(input);
                            if(res) {
                                user_args[name] = res.value;
                            } else {
                                return ["NOT_A_WORD", false];
                            }
                        break;
                        case "user":
                            res = command_parser.user(input);
                            if(res) {
                                user_args[name] = users[u_index];
                                u_index++;
                            } else {
                                return ["NOT_A_USER", false];
                            }
                        break;
                        case "role":
                            res = command_parser.role(input);
                            if(res) {
                                user_args[name] = roles[r_index];
                                r_index++;
                            } else {
                                return ["NOT_A_ROLE", false];
                            }
                        break;
                        case "channel":
                            res = command_parser.channel(input);
                            if(res) {
                                user_args[name] = channels[c_index];
                                c_index++;
                            } else {
                                return ["NOT_A_CHANNEL", false];
                            }
                        break;
                        case "string":
                            if(i == (args.length - 1)) {
                                let mapped_string = '';
                                for(let j = i; j < all_input.length; j++) {
                                    mapped_string += all_input[j] + ' ';
                                }
                                user_args[name] = mapped_string.trim();
                            } else {
                                return ["STRING_ONLY_LAST", false];
                            }
                        break;
                    }
                } else {
                    if(arg.required) {
                        return [{}, false]
                    } else {
                        let default_val = arg.default;
                        user_args[name] = default_val;
                    }
                };
            }

            return [user_args, true];
        }
        
        return [{}, true];
    }

    private _determine_command(subject : string) : boolean | CallableInterface {
        for(let i = 0; i < this.commands.length; i++) {
            let command : CommandInterface = this.commands[i];
            let instance : any = command.instance;

            let name : string | null | any = null;
            let is_valid : boolean = false;

            instance.name = instance.name.toLowerCase();
            let attempt = subject;
            if(attempt.includes('|'))
                attempt = subject.split('|')[0];

            if(attempt == instance.name) {
                name = instance.name;
                is_valid = true;
            } else if(instance.alias) {
                if(instance.alias instanceof Array) {
                    for(let i = 0; i < instance.alias.length; i++) {
                        if(attempt == instance.alias[i]) {
                            name = instance.alias[i];
                            is_valid = true;
                            break;
                        } 
                    }
                } else if(attempt == instance.alias) {
                    name = instance.alias;
                    is_valid = true;
                } 
            }

            if(is_valid) {
                let construct = command.construct;
                subject = trim_char(subject.replace(name, ''), '|');
                return {
                    name,
                    construct,
                    subject,
                    instance,
                }
            }
        }

        return false;
    }

    public register_event(event : any, handler : any) {
        this.client.on(event, handler);
        Log.Info(`Registered an Event Handler for "${event}"`);
    }

    public run(config : null | ConfigInterface) {
        Log.Progress('Starting Pre-process', 15);
        if(config) 
            this.configure(config);
        this._pre_process();
        this.client.login(this.token).then(() => {
            Log.Progress('Finished Processing.', 100);
            Log.Success('Bot has successfully Logged in.');
            Log.Info('Listening for commands...');
        });
    }
}