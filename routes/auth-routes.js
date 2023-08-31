module.exports = (config) => {
    const express = require('express');
    const nodemailer = require('nodemailer');
    const { check, validationResult } = require('express-validator');
    const router = express.Router();
    
    const emailHelper = require('../helper/email-helper')(config);
    const { getUserInfoByEmail, logLoginRequest, expireJWTCookie, insertNewUser, generateTempToken, verifyTempToken, updateUserPasswordById, deleteTempTokenByUserId } = require('../DAO/auth-DAO')(config);
    const { verifyPassword, createJWTUserCookie, createJWTAuthCookie, createSalt, createHashPassword } = require('../helper/auth-helper')(config);

    const serverConfig = config.server;
    
    const { ErrorResponse, FailureResponse, SuccessResponse } = require('../models/response-model');
    const { BadRequestError, InteralServerError, UnauthorizedError, NotFoundError } = require('../models/error-model');
    
    router.post('/login',
        check('email', 'Email is required.').notEmpty(),
        check('email', 'Must be an email format.').isEmail().normalizeEmail(),
        check('password', 'Password must be at minimum 8 characters and at maximum 100 characters').isLength({min: 8, max: 100}).notEmpty(),
        async (req, res) => {
            let valResult = validationResult(req);
            
            if (valResult.errors.length > 0) {
                let errorMessage = '';
                valResult.errors.forEach((error) => {
                    errorMessage += " " + error.msg;
                });
    
                let error = new BadRequestError(errorMessage);
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
            else {
                let email = req.body.email;
                let password = req.body.password;
    
                try {
                    let userInfo = await getUserInfoByEmail(email);
    
                    let hashPassword = userInfo ? userInfo.getHashPassword() : null;
                    let salt = userInfo ? userInfo.getSalt() : null;
    
                    if ((hashPassword && salt) && verifyPassword(password, hashPassword, salt)) {
                        let userCookie = createJWTUserCookie(userInfo.getUserInfo());
                        let authCookie = createJWTAuthCookie(email);
                        let logResult = await logLoginRequest(authCookie, req.socket.remoteAddress);
                        res.cookie(serverConfig.USER_DATA_COOKIE_NAME, userCookie);
                        res.status(200).cookie(serverConfig.COOKIE_NAME, authCookie, { httpOnly: true }).send(new SuccessResponse('Successfully logged in.').getResponse());
                    }
                    else {
                        let error = new UnauthorizedError('Invalid username or password.');
                        res.status(error.code).send(new FailureResponse(error).getResponse());
                    }
                }
                catch (err) {
                    let error = new InteralServerError('Issue logging into your account. Please try again.');
                    res.status(error.code).send(new ErrorResponse(error).getResponse());
                }
            }
    });
    
    router.delete('/logout', 
        async (req, res) => {
            if (Object.keys(req.cookies).length > 0 && req.cookies[serverConfig.COOKIE_NAME]) {
                try {
                    let authCookie = req.cookies[serverConfig.COOKIE_NAME];
    
                    let result = await expireJWTCookie(authCookie);
                    res.status(200).clearCookie(serverConfig.COOKIE_NAME, { httpOnly: true }).send(new SuccessResponse('Successfully logged out.').getResponse());
                }
                catch (err) {
                    let error = new InteralServerError('Issue logging out. Please try again later.');
                    res.status(error.code).send(new ErrorResponse(error).getResponse());
                }
            }
            else {
                let error = new NotFoundError('Could not logout, there is no login session.');
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
    });
    
    router.post('/signup', 
        check('email', 'Email is required.').notEmpty(),
        check('email', 'Must be an email format.').isEmail().normalizeEmail(),
        check('password', 'Password must be at minimum 8 characters and at maximum 100 characters.').notEmpty().isLength({min: 8, max: 100}),
        check('firstName', 'First name is required and cannot be longer than 50 characters.').notEmpty().isLength({max: 50}),
        check('lastName', 'Last name is required and cannot be longer than 50 characters.').notEmpty().isLength({max: 50}),
        async (req, res) => {
            let valResult = validationResult(req);
    
            if (valResult.errors.length > 0) {
                let errorMessage = '';
                valResult.errors.forEach((error) => {
                    errorMessage += " " + error.msg;
                });
    
                let error = new BadRequestError(errorMessage);
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
            else {
                try {
                    let email = req.body.email;
                    let emailExist = await getUserInfoByEmail(email);
    
                    if (emailExist) {
                        let error = new BadRequestError(`An account already exisits with the email ${email}, please create an account using a different email.`);
                        res.status(error.code).send(new FailureResponse(error).getResponse())
                    }
                    else {
                        let firstName = req.body.firstName;
                        let lastName = req.body.lastName;
                        let password = req.body.password;
                        let salt = createSalt();
                        let createDate = Date.now();
                        let hashPassword = createHashPassword(password, salt);
                        
                        let result = await insertNewUser(firstName, lastName, email, hashPassword, salt, createDate);
                        res.status(200).send(new SuccessResponse('Successfully created account!').getResponse());
                    }
                }
                catch (err) {
                    let error = new InteralServerError('Issue inserting your account. Please try again.');
                    res.status(error.code).send(new ErrorResponse(error).getResponse());
                }
            }
        
    });
    
    router.post('/forgotpassword',
        check('email', 'Email is required.').notEmpty(),
        check('email', 'Must be an email format.').isEmail().normalizeEmail(),
        async (req, res) => {
            let valResult = validationResult(req);
    
            if (valResult.errors.length > 0) {
                let errorMessage = '';
                
                valResult.errors.forEach((error) => {
                    errorMessage += " " + error.msg;
                })
    
                let error = new BadRequestError(errorMessage);
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
            else {
                let email = req.body.email;
                const responseMessage = `If an account exists with the email ${email}, then you will recieve an email with a link to reset your passsword.`;
                
                try {
                    let emailExist = await getUserInfoByEmail(email);
                
                    if (!emailExist) {
                        res.status(200).send(new SuccessResponse(responseMessage).getResponse());
                    }
                    else {
                        let userInfo = await getUserInfoByEmail(email);
                        let tokenData = await generateTempToken(email);
                        let emailResponse = await emailHelper.sendHTMLEmail(email, "HAHA You forgot your password.", await emailHelper.getForgotPasswordEmail(userInfo.getId(), userInfo.getFullName(), serverConfig.CLIENT_URL, tokenData.token, new Date(tokenData.expiration * 1000)));
    
                        res.status(200).send(new SuccessResponse(responseMessage).getResponse());
                    }
                }
                catch (err) {
                    let error = new InteralServerError("Issue sending the forgot password email. Please try again.");
                    res.status(error.code).send(new ErrorResponse(error).getResponse());
                }
            }
    });
    
    router.post('/resetpassword',
        check('userId', 'UserID is required.').notEmpty(),
        check('password', 'Password must be at minimum 8 characters and at maximum 100 characters.').notEmpty().isLength({min: 8, max: 100}),
        check('token', 'Token is required.').notEmpty(),
        async (req, res) => {
            let valResult = validationResult(req);
    
            if (valResult.errors.length > 0) {
                let errorMessage = '';
                
                valResult.errors.forEach((error) => {
                    errorMessage += " " + error.msg;
                })
    
                let error = new BadRequestError(errorMessage);
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
            else {
                
                let userId = req.body.userId;
                let password = req.body.password;
                let token = req.body.token;
    
                try {
                    let validToken = await verifyTempToken(userId, token);
                    
                    if (validToken) {
                        let salt = createSalt();
                        let hashPassword = createHashPassword(password, salt);
            
                        let updatePasswordResult = await updateUserPasswordById(hashPassword, salt, userId);
                        let removeTempTokenResult = await deleteTempTokenByUserId(userId);
    
                        res.status(200).send(new SuccessResponse('Successfully updated password!').getResponse());
    
                    }
                    else {
                        let error = new UnauthorizedError('Invalid reset password link. Please request a new one.');
                        res.status(error.code).send(new FailureResponse(error).getResponse());
                    }
                }
                catch (err) {
                    let error = new InteralServerError('Issue resetting password. Please try again.');
                    res.status(error.code).send(new ErrorResponse(error).getResponse());
                }
            }
    });

    return router;
};