import server from "./lib/server.js";
import worker from "./lib/worker.js";


//app object - module scaffolding
const app = {};

//create server
app.init = () => {
    server.init();

    worker.init();
}

//start the server
app.init();

//export the app
export default app;