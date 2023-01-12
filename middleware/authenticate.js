const authHelper = require('../helper/auth-helper');
const { UnauthorizedError } = require('../models/error-model');
const { FailureResponse } = require('../models/response-model');
const dotenv = require('dotenv');
dotenv.config();

let authRequest = async (req, res, next) => {
    let basepath = (req.path).split('/');
    
    // This checks if the request path starts with 'session' which would not need to be cookie verified
    if (basepath.length >= 2 && basepath[1] !== 'session') {
        if (Object.keys(req.cookies).length > 0 && req.cookies[process.env.COOKIE_NAME] && await authHelper.verifyJWTCookie(req.cookies[process.env.COOKIE_NAME], req.socket.remoteAddress)) {
            next();
        }
        else {
            let error = new UnauthorizedError('You do not have permission to access this route.');
            res.status(error.code).send(new FailureResponse(error).getResponse()).end();
        }
    }
    else {
        next();
    }
}

module.exports = authRequest;