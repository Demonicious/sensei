import BotInfoInterface from "./BotInfoInterface";

export default interface Config {
    token: string,
    prefix: string | string[],
    commands_directory: string,
    report_errors: boolean | undefined,
    enable_help_command: boolean | undefined,
    report_not_found: boolean | undefined,
    info: BotInfoInterface | undefined,
}