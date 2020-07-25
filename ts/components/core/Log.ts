import chalk from "chalk";

export default {
    Info: function(to_log : any) : Boolean {
        console.log(chalk.blue(`[INFO]: ${to_log}`));
        return true;
    },
    Danger: function(to_log : any) : Boolean {
        console.log(chalk.red(`[DANGER]: ${to_log}`));
        return true;
    },
    Warning: function(to_log : any) : Boolean {
        console.log(chalk.yellow(`[WARNING]: ${to_log}`));
        return true;
    },
    Success: function(to_log: any) : Boolean {
        console.log(chalk.green(`[SUCCESS]: ${to_log}`));
        return true;
    },
    Progress: function(to_log : any, percent : number) : Boolean {
        console.log(chalk.magenta(`[${percent}%]: ${to_log}`));
        return true;
    },
    Error: function(to_log: any | Error) : Boolean {
        console.log(chalk.bgWhite.white(to_log));
        return true;
    },
    Message: function(to_log: any) : Boolean {
        console.log(chalk.bgWhite.black(to_log));
        return true;
    }
}