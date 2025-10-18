
const sampleHandler = {};

sampleHandler.handleRequest = (requestProperties, callback) => {
    callback(200, { message: 'Hello World' })
}

export default sampleHandler;