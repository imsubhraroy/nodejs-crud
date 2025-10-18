
import Crypto from 'crypto';
import environmentToExport from './environment.js';
const utilities = {};

utilities.parseJson = (jsonString) => {
    let output = {};

    try {
        output = JSON.parse(jsonString)
    } catch {
        output = {};
    }

    return output;
}

utilities.makeHash = (data) => {
    if (typeof (data) === 'string' && data.length > 0) {
        const hash = Crypto.createHmac('sha256', environmentToExport.secretKey).update(data).digest('hex');

        return hash;
    } else {
        return false;
    }
}

utilities.createRandomString = (len) => {
    if (typeof (len) === 'number' && len > 0) {
        let output = '';
        const acceptableChar = 'abcdefghijklmnopqrstuvwxyz1234567890';
        for (let i = 1; i <= len; i++) {
            output += acceptableChar.charAt(Math.floor(Math.random() * len));
        }

        return output;
    }
    return false;
}

export default utilities;