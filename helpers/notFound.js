

const NotFoundHandler = {};

NotFoundHandler.handleRequest = (requestProperties, callback) => {
    callback(404, {
        message: 'Your Requested Not Found'
    });
}

export default NotFoundHandler;