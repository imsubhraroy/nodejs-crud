
import checkHandler from "./handlers/checkHandler.js";
import tokenHandler from "./handlers/routeHandler/tokenHandler.js";
import sampleHandler from "./handlers/sampleHandler.js";
import userHandler from "./handlers/userHandler.js";

const routes = {
    sample: sampleHandler.handleRequest,
    user: userHandler.handleRequest,
    token: tokenHandler.handleRequest,
    check: checkHandler.handleRequest
}

export default routes;