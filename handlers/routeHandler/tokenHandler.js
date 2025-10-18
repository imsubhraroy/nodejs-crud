import utilities from "../../helpers/utilities.js";
import lib from "../../lib/data.js";

const tokenHandler = {};

tokenHandler.handleRequest = (requestProperties, callback) => {
    const acceptMethod = ['get', 'post', 'put', 'delete']
    if (acceptMethod.indexOf(requestProperties.method) > -1) {
        tokenHandler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

tokenHandler._token = {};

tokenHandler._token.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length == 20 ? requestProperties.queryString.id : false;
    if (id) {
        lib.read('token', id, (err, token) => {
            const u = { ...utilities.parseJson(token) };
            if (!err && u) {
                callback(200, {
                    token: u
                });
            } else {
                callback(500, {
                    error: "token Not Found"
                })
            }
        });
    } else {
        callback(500, {
            error: 'token Not Found'
        });
    }
}

tokenHandler._token.post = (requestProperties, callback) => {
    const mobile = typeof (requestProperties.body.mobile) === 'string' && requestProperties.body.mobile.trim().length == 10 ? requestProperties.body.mobile : false;
    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (mobile && password) {
        lib.read('user', mobile, (err, user) => {
            if (!err && user) {
                if (utilities.makeHash(password) === utilities.parseJson(user).password) {
                    const token = utilities.createRandomString(20);
                    const object = {
                        'id': token,
                        mobile,
                        'expiry': Date.now() + 60 * 60 * 1000,
                    }

                    lib.create('token', token, object, (err) => {
                        if (!err) {
                            callback(200, object);
                        } else {
                            callback(500, { error: 'Error' })
                        }
                    });
                } else {
                    callback(500, {
                        error: 'Invalid Credentials'
                    });
                }
            } else {
                callback(500, {
                    error: 'Invalid Credentials'
                });
            }

        });
    } else {
        callback(400, {
            error: 'Field is Required'
        });
    }
}

tokenHandler._token.put = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    const extend = typeof (requestProperties.body.extend) === 'boolean' && requestProperties.body.extend ? true : false;

    if (id && extend) {
        lib.read('token', id, (err, token) => {
            const tokenData = { ...utilities.parseJson(token) };
            if (!err && tokenData) {
                if (tokenData.expiry < Date.now()) {
                    callback(400, {
                        error: 'Token Already Expiry'
                    })
                } else {
                    tokenData.expiry = Date.now() + 60 * 60 * 1000;
                    lib.update('token', id, tokenData, (err) => {
                        if (!err) {
                            callback(200, {
                                message: 'Token Updated'
                            });
                        } else {
                            callback(500, {
                                error: err
                            });
                        }
                    });
                }
            } else {
                callback(500, {
                    error: "Token Not Found"
                })
            }
        });
    } else {
        callback(400, {
            error: 'Invalid Mobile No'
        });
    }
}

tokenHandler._token.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryString.id) === 'string' && requestProperties.queryString.id.trim().length == 20 ? requestProperties.queryString.id : false;
    if (id) {
        lib.read('token', id, (err, token) => {
            if (!err && token) {
                lib.delete('token', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'token Deleted'
                        });
                    } else {
                        callback(500, {
                            error: err
                        });
                    }
                })
            } else {
                callback(500, {
                    error: "token Not Found"
                })
            }
        });
    } else {
        callback(500, {
            error: 'token Not Found'
        });
    }
}

tokenHandler._token.verify = (id, phone, callback) => {
    lib.read('token', id, (err, token) => {
        if (!err && token) {
            if (utilities.parseJson(token).mobile === phone && utilities.parseJson(token).expiry > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}

export default tokenHandler;