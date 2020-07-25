import SenseiCommandInterface from "./SenseiCommandInterface";

export default interface CommandInterface {
    instance: SenseiCommandInterface,
    construct: FunctionConstructor,
}