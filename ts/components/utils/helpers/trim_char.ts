import escape_regexp from "./escape_regexp";

export default (origString : string, charToTrim : string) => {
    charToTrim = escape_regexp(charToTrim);
    var regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
    return origString.replace(regEx, "");
}