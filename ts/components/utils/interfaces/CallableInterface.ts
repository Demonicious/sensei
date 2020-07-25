import SenseiCommandInterface from "./SenseiCommandInterface";

export default interface CallableInterface {
    name: string,
    subject: string,
    construct: FunctionConstructor,
    instance: SenseiCommandInterface
}