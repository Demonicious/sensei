import ArgumentInterface from "./ArgumentInterface";

export default interface SenseiCommandInterface {
    name  : string              | null     | undefined,
    alias : string              | string[] | null       | undefined,
    args  : ArgumentInterface[] | null     | undefined,
    run   : Function            | null     | undefined,
    init  : Function            | null     | undefined,
}