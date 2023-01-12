const express = require('express');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const mysqlConnect = require('../mysql-connect');
const authHelper = require('../helper/auth-helper');
const emailConfig = require('../config/email-config');
const router = express.Router();
const dotenv = require('dotenv');
const emailHelper = require('../helper/email-helper');
const { ErrorResponse, FailureResponse, SuccessResponse } = require('../models/response-model');
const { BadRequestError, InteralServerError, UnauthorizedError, NotFoundError } = require('../models/error-model');

dotenv.config();

router.post('/login',
    check('email', 'Email is required.').isEmail().notEmpty().normalizeEmail(),
    check('password', 'Password must be at minimum 8 characters and at maximum 100 characters').isLength({min: 8, max: 100}).notEmpty(),
    async (req, res) => {
        let valResult = validationResult(req);
        
        if (valResult.errors.length > 0) {
            let errorMessage = '';
            valResult.errors.forEach((error) => {
                errorMessage += " " + error.msg;
            });

            let error = new BadRequestError(errorMessage);
            res.status(error.code).send(new ErrorResponse(error).getResponse());
        }
        else {
            let email = req.body.email;
            let password = req.body.password;

            try {
                let userInfo = await authHelper.getUserInfoByEmail(email);

                let hashPassword = userInfo ? userInfo.getHashPassword() : null;
                let salt = userInfo ? userInfo.getSalt() : null;

                if ((hashPassword && salt) && authHelper.verifyPassword(password, hashPassword, salt)) {
                    let cookie = authHelper.createJWTCookie(email);
                    let logResult = await authHelper.logLoginRequest(cookie, req.socket.remoteAddress);
                    res.status(201).cookie(process.env.COOKIE_NAME, cookie, { httpOnly: true }).send(new SuccessResponse('Successfully logged in.').getResponse());
                    //res.status(201).cookie(process.env.COOKIE_NAME, cookie, { httpOnly: false }).send(new SuccessResponse('Successfully logged in.').getResponse());
                }
                else {
                    let error = new UnauthorizedError('Invalid username or password.');
                    res.status(error.code).send(new FailureResponse(error).getResponse());
                }
            }
            catch (err) {
                let error = new InteralServerError('Issue logging in your account. Please try again.');
                res.status(error.code).send(new ErrorResponse(error).getResponse());
            }
        }
});

router.delete('/logout', 
    async (req, res) => {
        if (Object.keys(req.cookies).length > 0 && req.cookies[process.env.COOKIE_NAME]) {
            try {
                let authCookie = req.cookies[process.env.COOKIE_NAME];

                let result = await authHelper.expireJWTCookie(authCookie);
                res.status(200).clearCookie(process.env.COOKIE_NAME, { httpOnly: true }).send(new SuccessResponse('Successfully logged out.').getResponse());
            }
            catch (err) {
                let error = new InteralServerError('Issue logging out. Please try again later.');
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
        }
        else {
            let error = new NotFoundError('Could not logout, there is no login session.');
            res.status(error.code).send(new FailureResponse(error).getResponse());
        }
});

router.post('/signup', 
    check('email', 'Email is required.').notEmpty().isEmail().normalizeEmail(),
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
            res.status(error.code).send(new ErrorResponse(error).getResponse());
        }
        else {
            try {
                let email = req.body.email;
                let emailExist = await authHelper.getUserInfoByEmail(email);

                if (emailExist) {
                    let error = new BadRequestError(`An account already exisits with the email ${email}, please create an account using a different email.`);
                    res.status(error.code).send(new FailureResponse(error).getResponse())
                }
                else {
                    let firstName = req.body.firstName;
                    let lastName = req.body.lastName;
                    let password = req.body.password;
                    let salt = authHelper.createSalt();
                    let createDate = Date.now();
                    let hashPassword = authHelper.createHashPassword(password, salt);
                        
                    let result = await mysqlConnect.authQuery('INSERT into User(first_name, last_name, email, hash_password, salt, create_date) VALUES (?,?,?,?,?,?)', [ firstName, lastName, email, hashPassword, salt, createDate ]);
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
    check('email', 'Email is required.').notEmpty().isEmail().normalizeEmail(),
    async (req, res) => {
        let valResult = validationResult(req);

        if (valResult.errors.length > 0) {
            let errorMessage = '';
            
            valResult.errors.forEach((error) => {
                errorMessage += " " + error.msg;
            })

            let error = new BadRequestError(errorMessage);
            res.status(error.code).send(new ErrorResponse(error).getResponse());
        }
        else {
            let email = req.body.email;
            const responseMessage = `If an account exists with the email ${email}, then you will recieve an email with a link to reset your passsword.`;
            
            try {
                let emailExist = await authHelper.getUserInfoByEmail(email);
            
                if (!emailExist) {
                    res.status(200).send(new SuccessResponse(responseMessage).getResponse());
                }
                else {
                    let transporter = nodemailer.createTransport({
                        host: emailConfig.host,
                        port: emailConfig.port,
                        auth: {
                            user: emailConfig.auth.user,
                            pass: emailConfig.auth.pass
                        }
                    });
                    let userInfo = await authHelper.getUserInfoByEmail(email);
                    let tokenData = await authHelper.generateTempToken(email);

                    let emailResponse = await transporter.sendMail({
                        from: emailConfig.auth.user,
                        to: email,
                        subject: "HAHA You forgot your password.",
                        html: await emailHelper.getForgotPasswordEmail(userInfo.getId(), userInfo.getFullName(), process.env.CLIENT_URL, tokenData.token, new Date(tokenData.expiration * 1000))
                    });

                    res.status(200).send(new SuccessResponse(responseMessage).getResponse());
                }
            }
            catch (err) {
                let error = new InteralServerError(err);
                res.status(error.code).send(new ErrorResponse(error).getResponse());
            }
        }
});

router.post('/resetpassword',
    check('userId', 'UserID is required.').notEmpty().isInt(),
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
            res.status(error.code).send(new ErrorResponse(error).getResponse());
        }

        let userId = req.body.userId;
        let password = req.body.password;
        let token = req.body.token;

        try {
            let validToken = await authHelper.verifyTempToken(userId, token);
            
            if (validToken) {
                let salt = authHelper.createSalt();
                let hashPassword = authHelper.createHashPassword(password, salt);
    
                let updatePasswordResult = await mysqlConnect.authQuery('UPDATE User SET hash_password = ?, salt = ? WHERE id = ?', [ hashPassword, salt, userId ]);
                let removeTempTokenResult = await authHelper.deleteTempTokenByUserId(userId);
                res.status(200).send(new SuccessResponse('Successfully updated password!').getResponse());

            }
            else {
                let error = new UnauthorizedError('Invalid reset password link. Please request a new one.');
                res.status(error.code).send(new FailureResponse(error).getResponse());
            }
        }
        catch (err) {
            let error = new InteralServerError(err);
            res.status(error.code).send(new ErrorResponse(error).getResponse());
        }
});

module.exports = router;