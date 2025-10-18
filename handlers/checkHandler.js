import environmentToExport from "../helpers/environment.js";
import utilities from "../helpers/utilities.js";
import lib from "../lib/data.js";
import tokenHandler from "./routeHandler/tokenHandler.js";

const checkHandler = {};

checkHandler.handleRequest = (requestProperties, callback) => {
    const acceptMethod = ['get', 'post', 'put', 'delete']
    if (acceptMethod.indexOf(requestProperties.method) > -1) {
        checkHandler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

checkHandler._check = {};

checkHandler._check.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length == 20 ? requestProperties.queryString.id : false;
    if (id) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        lib.read('checks', id, (err, data) => {
            if (!err && data) {
                const checkData = utilities.parseJson(data);
                tokenHandler._token.verify(token, checkData.mobile, (status) => {
                    if (status) {
                        callback(200, {
                            checks: checkData
                        })
                    } else {
                        callback(403, { error: 'Unauthenticated' })
                    }
                })
            }
        })
    } else {
        callback(500, {
            error: 'Check Not Found'
        });
    }
}

checkHandler._check.post = (requestProperties, callback) => {
    const protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    const url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    const method = typeof (requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method.toLowerCase()) > -1 ? requestProperties.body.method : false;
    const successCode = typeof (requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;
    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 && requestProperties.body.timeoutSeconds % 1 === 0 ? requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && successCode && timeoutSeconds) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        // Look up the user mobile by toke
        lib.read('token', token, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenObject = { ...utilities.parseJson(tokenData) };
                //Look up the user data 
                lib.read('user', tokenObject.mobile, (err2, user) => {
                    if (!err2 && user) {
                        tokenHandler._token.verify(token, tokenObject.mobile, (status) => {
                            if (status) {
                                const userObject = { ...utilities.parseJson(user) }
                                let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length < environmentToExport.maxCheck) {
                                    const checkId = utilities.createRandomString(20);
                                    let checkObject = {
                                        id: checkId,
                                        'mobile': userObject.mobile,
                                        url,
                                        method,
                                        protocol,
                                        successCode,
                                        timeoutSeconds
                                    }

                                    lib.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the user object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);
                                            lib.update('user', userObject.mobile, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, { 'check': checkObject });
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem on the server side'
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, { error: 'There was a problem on the server side' })
                                        }
                                    })
                                } else {
                                    callback(401, {
                                        error: "Reached max checks limit"
                                    })
                                }
                            } else {
                                callback(403, {
                                    error: "Unauthenticated"
                                })
                            }
                        })
                    } else {
                        callback(500, {
                            error: 'User not found'
                        })
                    }
                })
            } else {
                callback(500, {
                    error: 'User not found'
                })
            }
        })
    } else {
        callback(400, {
            'error': 'Invalid Data'
        })
    }
}

checkHandler._check.put = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    const protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    const url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    const method = typeof (requestProperties.body.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(requestProperties.body.method.toLowerCase()) > -1 ? requestProperties.body.method : false;
    const successCode = typeof (requestProperties.body.successCode) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;
    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 && requestProperties.body.timeoutSeconds % 1 === 0 ? requestProperties.body.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || successCode || timeoutSeconds) {
            let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

            lib.read('checks', id, (err, data) => {
                if (!err && data) {
                    const checkData = utilities.parseJson(data);
                    tokenHandler._token.verify(token, checkData.mobile, (status) => {
                        if (status) {
                            // Look up the user mobile by toke
                            lib.read('token', token, (err2, tokenData) => {
                                if (!err2 && tokenData) {
                                    //Look up the user data 
                                    if (protocol) {
                                        checkData.protocol = protocol
                                    }
                                    if (url) {
                                        checkData.url = url
                                    }
                                    if (successCode) {
                                        checkData.successCode = successCode
                                    }
                                    if (method) {
                                        checkData.method = method
                                    }
                                    if (timeoutSeconds) {
                                        checkData.timeoutSeconds = timeoutSeconds
                                    }

                                    lib.update('checks', id, checkData, (err3) => {
                                        if (!err3) {
                                            callback(200, {
                                                'message': 'Check Update'
                                            })
                                        } else {
                                            callback(500, { error: "There is a error in the server side" })
                                        }
                                    });
                                } else {
                                    callback(500, {
                                        error: 'Unauthenticated'
                                    })
                                }
                            })
                        } else {
                            callback(403, { error: 'Unauthenticated' })
                        }
                    })
                }
            })

        } else {
            callback(400, {
                'error': 'Invalid Data'
            })
        }
    } else {
        callback(200, { error: "Not Found" })
    }
}

checkHandler._check.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length == 20 ? requestProperties.queryString.id : false;
    if (id) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        lib.read('checks', id, (err, data) => {
            if (!err && data) {
                const checkData = utilities.parseJson(data);
                const mobile = checkData.mobile;
                tokenHandler._token.verify(token, checkData.mobile, (status) => {
                    if (status) {
                        lib.delete('checks', id, (err1) => {
                            if (!err1) {
                                lib.read('user', mobile, (err3, user) => {
                                    if (!err3 && user) {
                                        const userObject = utilities.parseJson(user);
                                        let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                        //Remove deleted check id
                                        let checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;

                                            lib.update('user', mobile, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, {
                                                        message: "Check Deleted"
                                                    })
                                                } else {
                                                    callback(500, {
                                                        error: "Server error F"
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, {
                                                error: "Check"
                                            })
                                        }
                                    } else {
                                        callback(500, {
                                            error: "Error"
                                        })
                                    }
                                })
                            } else {
                                callback(500, {
                                    error: "Error"
                                })
                            }
                        })
                    } else {
                        callback(403, { error: 'Unauthenticated' })
                    }
                })
            }
        })
    } else {
        callback(500, {
            error: 'Check Not Found'
        });
    }
}


export default checkHandler;