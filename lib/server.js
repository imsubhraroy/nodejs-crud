
import http from 'http';
import handler from '../helpers/handleReqRes.js';
import env from '../helpers/environment.js'

//app object - module scaffolding
const server = {};

//create server
server.createServer = () => {
    const createServer = http.createServer(handler.handleRequest);
    createServer.listen(env.port, () => {
        console.log(`Server is listening on port ${env.port}`);
    });
}


server.init = () => {
    //start the server
    server.createServer();
}

//export the server
export default server;