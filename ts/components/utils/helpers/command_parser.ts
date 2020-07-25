export default {
    number: (subject : any) : boolean | any => {
        let num = parseFloat(subject);
        if(isNaN(num))
            return false;
        return {
            value: num
        }
    },
    word: (subject : any) : boolean | any => {
        return {
            value: <string>subject
        }
    },
    user: (subject : any) : boolean | any => {
        if(subject.length == 22) {
            if(subject.includes("<@!") && subject.includes(">")) {
                if((/^\d+$/.test(subject.replace('<@!', '').replace('>', ''))))
                    return true;
            }
        }

        return false;
    },
    role: (subject : any) : boolean | any => {
        if(subject.length == 22) {
            if(subject.includes("<@&") && subject.includes(">")) {
                if((/^\d+$/.test(subject.replace('<@&', '').replace('>', ''))))
                    return true;
            }
        }

        return false;
    },
    channel: (subject : any) : boolean | any => {
        if(subject.length == 21) {
            if(subject.includes("<#") && subject.includes(">")) {
                if((/^\d+$/.test(subject.replace('<#', '').replace('>', ''))))
                    return true;
            }
        }

        return false;
    },
}