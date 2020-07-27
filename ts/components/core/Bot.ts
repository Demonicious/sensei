import { resolve }      from "path";
import { readdirSync, } from "fs";

import * as Discord from "discord.js";
import Log          from "./Log";

import ConfigInterface          from "../utils/interfaces/ConfigInterface";
import CommandInterface         from "../utils/interfaces/CommandInterface";
import CallableInterface        from "../utils/interfaces/CallableInterface";
import ArgumentInterface        from "../utils/interfaces/ArgumentInterface";

import trim_char        from "./../utils/helpers/trim_char";
import command_parser   from "./../utils/helpers/command_parser";
import BotInfoInterface from "../utils/interfaces/BotInfoInterface";

export default class Bot {
    private client              : Discord.Client;

    private prefix              : string | string[];
    private commands_directory  : string;
    private token               : string;
    private report_errors       : boolean;
    private report_not_found    : boolean;
    private enable_help_command : boolean;

    private info                : BotInfoInterface;

    private commands            : any[];
    private names               : string[];
    private cooldowns           : Set<unknown>;

    private update_hook         : any;
    private delete_hook         : any;

    constructor(config: null | ConfigInterface) {
        this.client = new Discord.Client();

        this.prefix             = 'af+';
        this.commands_directory = "./commands";
        this.token              = "";

        this.report_errors       = true;
        this.report_not_found    = false;
        this.enable_help_command = true;

        this.info = {
            name:            'Sensei 2',
            theme_color:     '#74a7f5',
            secondary_color: '#36393f',
            danger_color   : '#ff3030',
            success_color  : '#30ff66'
        };

        this.update_hook = {};
        this.delete_hook = {};

        this.commands  = [];
        this.names     = [];
        this.cooldowns = new Set();

        Log.Info('A new client was created.');
        if(config) {
            this.configure(config);
        }
    }

    private async _handle_update(message : Discord.Message | any) : Promise<any> {
        if(this.update_hook.hasOwnProperty(message.id))
            return this.update_hook[message.id]['callback'](message, this.update_hook[message.id]['args']);
    }
    
    private async _handle_delete(message : Discord.Message | any) : Promise<any> {
        if(this.delete_hook.hasOwnProperty(message.id)) {
            let cb = this.delete_hook[message.id]['callback'];
            let args = {...this.delete_hook[message.id]['args']};
            delete(this.delete_hook[message.id]);
            return cb(message, args);
        }
    }

    private async _handle_message(message : Discord.Message) : Promise<any> {
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
            let command : any = this._determine_command(subject);
            if(command) {
                subject = command.subject;
                let construct : any = command.construct;
                let instance = new construct(this.client, message, this.info);

                if(instance.cooldown) {
                    if(this.cooldowns.has(`${instance.name}_${message.author.id}`)) {
                        return;
                    }
                }

                if(instance.args) {
                    const [args, result] : any = this._determine_arguments(instance.args, subject, message);
                    if(result) {
                        if(instance.cooldown) {
                            this._set_cooldown(instance.name, message.author.id, instance.cooldown);
                        }
                        return this._execute_command(message, instance, args);
                    } else {
                        if(this.report_errors) {
                            const embed = new Discord.MessageEmbed();
                            embed.setColor(this.info.danger_color);
                            embed.setFooter(this.info.name);
                            embed.setTimestamp();

                            embed.setAuthor("Invalid Usage.", <any>this.client.user?.avatarURL());
                            if(this.enable_help_command)
                                embed.setDescription(`See **${selected_prefix}help ${command.name}** for usage instructions.`);

                            // Specific Error Reporting, - args[1] = Argument Number
                            /* switch(args[0]) {
                                case "REQUIRED":
                                    embed.setTitle("Insufficient Arguments.");
                                    Log.Danger('Insufficient Arguments.');
                                break;
                                case "NOT_A_NUMBER":
                                    embed.setTitle("Argument must be a number.");
                                    Log.Danger('Argument must be a Number.');
                                break;
                                case "NOT_A_WORD":
                                    embed.setTitle("Argument must be a word.");
                                    Log.Danger('Argument must be an Alphanumeric Word.');
                                break;
                                case "NOT_A_USER":
                                    embed.setTitle("Argument must be a User Mention.");
                                    Log.Danger('Argument must be a User Mention.');
                                break;
                                case "NOT_A_ROLE":
                                    embed.setTitle("Argument must be a Role Mention.");
                                    Log.Danger('Argument must be a Role Mention.');
                                break;
                                case "NOT_A_CHANNEL":
                                    embed.setTitle("Argument must be a Channel Mention.");
                                    Log.Danger('Argument must be a Channel Mention.');
                                break;
                                case "STRING_ONLY_LAST":
                                    embed.setTitle("Only the final argument may be a string.");
                                    Log.Danger('Only the final argumnet may be a string.');
                                break;
                            } */

                            return message.channel.send(embed);
                        }
                    }
                } else {
                    if(instance.cooldown) {
                        this._set_cooldown(instance.name, message.author.id, instance.cooldown);
                    }
                    return this._execute_command(message, instance);
                }
            } else if(this.report_not_found) {
                const embed = new Discord.MessageEmbed();
                embed.setColor(this.info.danger_color);
                embed.setFooter(this.info.name);
                embed.setTimestamp();

                embed.setAuthor("Command not found.", <any>this.client.user?.avatarURL());
                if(this.enable_help_command)
                    embed.setDescription(`See **${selected_prefix}help** for a list of available commands.`);

                return message.channel.send(embed);
            }
        }
    }

    private async _execute_command(message : Discord.Message, instance : any, args : any = {}) {
        if(instance.before_run)
            await instance.before_run({...args});
        await instance.run({...args});
        if(instance.after_run)
            await instance.after_run({...args});

        if(instance.on_update)
            this.update_hook[message.id] = { args: args, callback: instance.on_update };
        if(instance.on_delete)
            this.delete_hook[message.id] = { args: args, callback: instance.on_delete };

        return true;
    }

    private _set_cooldown(name : string, id : string, duration : number) {
        this.cooldowns.add(`${name}_${id}`);
        setTimeout(() => {
            this.cooldowns.delete(`${name}_${id}`);
        }, duration * 1000);
    }

    private _determine_arguments(args : ArgumentInterface[], subject : string, message : Discord.Message) : any {
        console.log(args);
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

            let user_args : any = {};

            for(let i = 0; i < args.length; i++) {
                let arg : ArgumentInterface = args[i];
                let input = (typeof all_input[i] != 'undefined') ? all_input[i] : null;

                let name = arg.name;
                if(input && input != '') {
                    let res : any = null;

                    switch(arg.type.toLowerCase()) {
                        case "number":
                            res = command_parser.number(input);
                            if(res) {
                                user_args[name] = res.value;
                            } else {
                                return [["NOT_A_NUMBER", i + 1], false];
                            }
                        break;
                        case "word":
                            res = command_parser.word(input);
                            if(res) {
                                user_args[name] = res.value;
                            } else {
                                return [["NOT_A_WORD", i + 1], false];
                            }
                        break;
                        case "user":
                            res = command_parser.user(input);
                            if(res) {
                                user_args[name] = users[u_index];
                                u_index++;
                            } else {
                                return [["NOT_A_USER", i + 1], false];
                            }
                        break;
                        case "role":
                            res = command_parser.role(input);
                            if(res) {
                                user_args[name] = roles[r_index];
                                r_index++;
                            } else {
                                return [["NOT_A_ROLE", i + 1], false];
                            }
                        break;
                        case "channel":
                            res = command_parser.channel(input);
                            if(res) {
                                user_args[name] = channels[c_index];
                                c_index++;
                            } else {
                                return [["NOT_A_CHANNEL", i + 1], false];
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
                                return [["STRING_ONLY_LAST", i + 1], false];
                            }
                        break;
                    }
                } else {
                    if(arg.required) {
                        return [['REQUIRED', i + 1], false]
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

    public configure(config : ConfigInterface) : Bot {
        this.prefix               = config.prefix;
        this.token                = config.token;
        this.commands_directory   = config.commands_directory;

        if(typeof config.report_errors != 'undefined')
            this.report_errors = config.report_errors;
        if(typeof config.report_not_found != 'undefined')
            this.report_not_found = config.report_not_found;
        if(typeof config.enable_help_command != 'undefined')
            this.enable_help_command = config.enable_help_command;

        if(typeof config.info != 'undefined') {
            if(config.info.name)
                this.info.name = config.info.name;
            if(config.info.theme_color)
                this.info.theme_color = config.info.theme_color;
            if(config.info.secondary_color)
                this.info.secondary_color = config.info.secondary_color;
            if(config.info.danger_color)
                this.info.danger_color = config.info.danger_color;
            if(config.info.success_color)
                this.info.success_color = config.info.success_color;
        }

        Log.Success('Configured Successfully.');
        return this;
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
                    let instance = new construct(this.client, null, this.info);

                    if(!this.names.includes(instance.name.toLowerCase())) {
                        this.names = [...this.names, instance.name.toLowerCase()];
                        return {
                            instance,
                            construct
                        }
                    } else {
                        Log.Warning(new Error(`Command ${instance.name} already exists. Multiple commands may not have same names.`));
                    }
                }
            }

            return null
        }).filter(command => command);

        Log.Progress('Commands Setup', 45);
    }

    private _system_events() {
        this.client.on("message", this._handle_message.bind(this));
        this.client.on("messageUpdate", this._handle_update.bind(this));
        this.client.on("messageDelete", this._handle_delete.bind(this));
        Log.Progress('System Events Setup', 85);
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