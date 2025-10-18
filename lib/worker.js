import lib from './data.js';
import utilities from '../helpers/utilities.js';
import url from 'url';
import http from 'http';
import https from 'https';
import notification from '../helpers/notification.js';

//app object - module scaffolding
const worker = {};

worker.validateCheckData = (data) => {
    if (data && data.id) {
        const originalData = data;

        originalData.state = typeof (data.state) === 'string' && ['up', 'down'].indexOf(data.state) > -1 ? data.state : false;
        originalData.lastChecked = typeof (data.lastChecked) === 'number' && data.lastChecked > 0 ? data.lastChecked : false;

        worker.performChecks(originalData);
    } else {
        console.log('Error: check was invalid or not properly formatted');

    }
}

worker.performChecks = (data) => {
    let checkOutcome = {
        'error': false,
        'responseCode': false,
        'value': false
    };
    let outcomeSend = false;

    let parsedUrl = url.parse(data.protocol + '://' + data.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    //construct the request
    const requestDetails = {
        'protocol': data.protocol + ':',
        'hostname': hostName,
        'method': data.method.toUpperCase(),
        'path': path,
        'timeout': data.timeoutSeconds * 1000
    };

    const protocolToUse = data.protocol === 'http' ? http : https;

    let req = protocolToUse.request(requestDetails, (res) => {
        //check status
        const status = res.statusCode;
        checkOutcome.responseCode = status;
        if (!outcomeSend) {
            worker.processCheckOutcome(data, checkOutcome);
            outcomeSend = true;
        }

    });

    req.on('error', (err) => {
        if (!outcomeSend) {
            checkOutcome.error = true;
            checkOutcome.value = err
            worker.processCheckOutcome(origin, checkOutcome);
            outcomeSend = true;
        }
    });

    req.on('timeout', () => {
        if (!outcomeSend) {
            checkOutcome.error = true;
            checkOutcome.value = 'timeout'
            worker.processCheckOutcome(origin, checkOutcome);
            outcomeSend = true;
        }
    });

    req.end();
}


worker.processCheckOutcome = (data, response) => {
    let state = !response.error && response.responseCode && data.successCode.indexOf(response.responseCode) > -1 ? 'up' : 'down';

    let alertWanted = data.lastChecked && data.state !== state ? true : false;

    // update the check data
    let newData = data;
    newData.state = state;
    newData.lastChecked = Date.now();

    lib.update('checks', newData.id, newData, (err) => {
        if (!err) {
            if (alertWanted) {
                worker.alertUserToStatusChange(newData);
            } else {
                console.log('Alert is not needed');

            }
        } else {
            console.log('Error in updating check data');

        }
    });
}

worker.alertUserToStatusChange = (data) => {
    let msg = `Alert: your check for ${data.method.toUpperCase()} ${data.protocol}://${data.url} is currently ${data.state}`;

    notification.sendTwilioSMS(data.mobile, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via sms: ${msg}`);
        } else {
            console.log('Error is sending sms');
        }
    });
}

worker.gatherAllChecks = () => {
    lib.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(element => {
                lib.read('checks', element, (err1, data) => {
                    if (!err1 && data) {
                        worker.validateCheckData(utilities.parseJson(data));
                    } else {
                        console.log('Error reading checks');

                    }
                })
            });
        } else {
            console.log(err);
        }
    })
}

//timer to execute the worker process
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 10000);
}

worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    worker.loop();
}

//export the worker
export default worker;