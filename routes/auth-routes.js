const express = require('express');
const nodemailer = require('nodemailer');
const mysqlConnect = require('../mysql-connect');
const authRoutesHelper = require('../helper/auth-routes-helper');
const emailConfig = require('../config/email-config');
const router = express.Router();
const dotenv = require('dotenv');
const emailHelper = require('../helper/email-helper');

dotenv.config();

router.post('/login', (req, res) => {
    let form = req.body;
    
    // TODO: Validate form
    let email = form.email;
    let password = form.password;

    mysqlConnect.authQuery('SELECT * FROM User WHERE email = ? LIMIT 1', [ email ])
        .then((result) => {
            let hashPassword = result.results[0].hash_password;
            let salt = result.results[0].salt;

            if (authRoutesHelper.verifyPassword(password, hashPassword, salt)) {
                let cookie = authRoutesHelper.createCookie(email);

                authRoutesHelper.logLoginRequest(email, cookie, req.socket.remoteAddress)
                    .then(() => {
                        res.status(201).cookie(process.env.COOKIE_NAME, cookie, { httpOnly: true }).send('Valid password.');
                    })
                    .catch((err) => {
                        res.status(500).send(err);
                    });
            }
            else {
                res.status(401).send('Invalid password.');
            }
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});

router.delete('/logout', (req, res) => {
    // TODO: Figure out how to correctly logout
    res.clearCookie(process.env.COOKIE_NAME, { path: '/' });
    res.status(200).send();
});

router.post('/signup', (req, res) => {
    let form = req.body;

    // TODO: Validate form - ensure account email is unique
    let firstName = form.firstName;
    let lastName = form.lastName;
    let email = form.email;
    let password = form.password;
    let salt = authRoutesHelper.createSalt();
    let createDate = Date.now();

    let hashPassword = authRoutesHelper.createHashPassword(password, salt);
    
    mysqlConnect.authQuery('INSERT into User(first_name, last_name, email, hash_password, salt, create_date) VALUES (?,?,?,?,?,?)', [ firstName, lastName, email, hashPassword, salt, createDate ])
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });
});

router.post('/forgotpassword', async (req, res) => {
    let form = req.body;

    let email = form.email;
    let transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
            user: emailConfig.auth.user,
            pass: emailConfig.auth.pass
        }
    });

    try {
        let passwordData = await authRoutesHelper.validateTempPassword(email);

        let emailResponse = await transporter.sendMail({
            from: emailConfig.auth.user,
            to: email,
            subject: "HAHA You forgot your password.",
            html: await emailHelper.getForgotPassEmail(passwordData.password, new Date(passwordData.expiration * 1000))
        });

        res.send(emailResponse);
    }
    catch (err) {
        res.send(err);
    }
});

module.exports = router;