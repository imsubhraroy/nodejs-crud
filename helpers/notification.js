import environmentToExport from "./environment.js";
import querystring from 'querystring';
import twilio from 'twilio';
const client = new twilio(environmentToExport.twilio.accountSid, environmentToExport.twilio.authToken);

const notification = {};

//send sms to user using twilio api
notification.sendTwilioSMS = (mobile, msg, callback) => {
    const userPhone = typeof (mobile) === 'string' && mobile.trim().length === 10 ? mobile.trim() : false;
    const userMsg = typeof (msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (userMsg && userPhone) {
        // configure the request payload
        client.messages
            .create({
                body: userMsg,
                to: '+91' + userPhone, // Text your number
                from: environmentToExport.twilio.fromPhone, // From a valid Twilio number
            })
            .then((message) => callback(false))
            .catch((error) => callback('error'));
    } else {
        callback('Invalid Data')
    }
}

export default notification;