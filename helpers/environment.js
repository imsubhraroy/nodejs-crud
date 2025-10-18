
const environment = {};

environment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: '',
    maxCheck: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: ''
    }
}

environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: '',
    maxCheck: 5,
    twilio: {
        fromPhone: '',
        accountSid: '',
        authToken: ''
    }
}

const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.trim() : 'staging';


const environmentToExport = typeof (environment[currentEnvironment]) === 'object' ? environment[currentEnvironment] : environment.staging;

export default environmentToExport;