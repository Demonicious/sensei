export default interface ArgumentInterface {
    name: string,
    type: 'NUMBER' | 'WORD' | 'USER' | 'ROLE' | 'CHANNEL' | 'STRING',
    default: undefined | null | string | number | any,
    required: undefined | null | boolean
}