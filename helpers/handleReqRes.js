

import url from 'url';
import { StringDecoder } from 'string_decoder';
import routes from '../route.js';
import NotFoundHandler from './notFound.js';
import utilities from './utilities.js';

const handler = {};

handler.handleRequest = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryString = parsedUrl.query;
    const headerObject = req.headers;

    const parameter = {
        path,
        trimmedPath,
        method,
        queryString,
        headerObject
    }

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : NotFoundHandler.handleRequest;


    const decoder = new StringDecoder('utf-8');
    let payload = '';

    req.on('data', (buffer) => {
        payload += decoder.write(buffer);
    });

    req.on('end', () => {
        payload += decoder.end();
        parameter.body = utilities.parseJson(payload);
        chosenHandler(parameter, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            payload = typeof (payload) === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.statusCode = statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(payloadString);
        });
    });

    //response handle
};

export default handler;