import utilities from "../helpers/utilities.js";
import lib from "../lib/data.js";
import tokenHandler from "./routeHandler/tokenHandler.js";


const userHandler = {};

userHandler.handleRequest = (requestProperties, callback) => {
    const acceptMethod = ['get', 'post', 'put', 'delete']
    if (acceptMethod.indexOf(requestProperties.method) > -1) {
        userHandler._user[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
}

userHandler._user = {};

userHandler._user.get = (requestProperties, callback) => {
    const mobile = typeof (requestProperties.queryString.mobile) === 'string' && requestProperties.queryString.mobile.trim().length == 10 ? requestProperties.queryString.mobile : false;
    if (mobile) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(token, mobile, (status) => {
            if (status) {
                lib.read('user', mobile, (err, user) => {
                    const u = { ...utilities.parseJson(user) };
                    if (!err && u) {
                        delete u.password;
                        callback(200, {
                            user: u
                        });
                    } else {
                        callback(500, {
                            error: "User Not Found"
                        })
                    }
                });
            } else {
                callback(403, { error: 'Unauthenticated' })
            }
        })
    } else {
        callback(500, {
            error: 'User Not Found'
        });
    }

}

userHandler._user.post = (requestProperties, callback) => {
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const mobile = typeof (requestProperties.body.mobile) === 'string' && requestProperties.body.mobile.trim().length == 10 ? requestProperties.body.mobile : false;
    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    const tosAgreement = typeof (requestProperties.body.tosAgreement) === 'string' && requestProperties.body.tosAgreement.trim().length > 0 ? requestProperties.body.tosAgreement : false;

    if (firstName && lastName && mobile && tosAgreement && password) {
        lib.read('user', mobile, (err, user) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    mobile,
                    tosAgreement,
                    password: utilities.makeHash(password)
                };

                lib.create('user', mobile, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User Added'
                        });
                    } else {
                        callback(500, {
                            error: err
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'User already exits'
                });
            }

        });
    } else {
        callback(400, {
            error: 'Field is Required'
        });
    }
}

userHandler._user.put = (requestProperties, callback) => {
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const mobile = typeof (requestProperties.body.mobile) === 'string' && requestProperties.body.mobile.trim().length == 10 ? requestProperties.body.mobile : false;
    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (mobile) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(token, mobile, (status) => {
            if (status) {
                if (firstName || lastName || password) {
                    lib.read('user', mobile, (err, user) => {
                        const u = { ...utilities.parseJson(user) };
                        if (!err && u) {
                            if (firstName) {
                                u.firstName = firstName;
                            }
                            if (lastName) {
                                u.lastName = lastName;
                            }
                            if (password) {
                                u.password = utilities.makeHash.makeHash(password);
                            }
                            lib.update('user', mobile, u, (err) => {
                                if (!err) {
                                    callback(200, {
                                        message: 'User Updated'
                                    });
                                } else {
                                    callback(500, {
                                        error: err
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                error: "User Not Found"
                            })
                        }
                    });
                } else {
                    callback(400, {
                        error: 'You have a problem in your request'
                    })
                }
            } else {
                callback(403, { error: 'Unauthenticated' })
            }
        })
    } else {
        callback(400, {
            error: 'Invalid Mobile No'
        });
    }
}

userHandler._user.delete = (requestProperties, callback) => {
    if (requestProperties.queryString?.mobile) {
        let token = typeof (requestProperties.headerObject.token) === 'string' && requestProperties.headerObject.token.length == 20 ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(token, requestProperties.queryString?.mobile, (status) => {
            if (status) {
                lib.read('user', requestProperties.queryString?.mobile, (err, user) => {
                    if (!err) {
                        lib.delete('user', requestProperties.queryString?.mobile, (err) => {
                            if (!err) {
                                callback(200, {
                                    message: 'User Deleted'
                                });
                            } else {
                                callback(500, {
                                    error: err
                                });
                            }
                        })
                    } else {
                        callback(500, {
                            error: "User Not Found"
                        })
                    }
                });
            } else {
                callback(403, { error: 'Unauthenticated' })
            }
        })
    } else {
        callback(500, {
            error: 'User Not Found'
        });
    }
}

userHandler._fieldValidation = (type, data, fieldName, length, callback) => {
    const trimData = data.trim();
    if (typeof (trimData) === type && trimData.length >= length) {
        return trimData;
    } else {
        callback(400, {
            error: { [fieldName]: `${fieldName} is required` }
        })
        return false;
    }
}

export default userHandler;