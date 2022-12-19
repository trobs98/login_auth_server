const express = require('express');
const mysqlConnect = require('../mysql-connect');
const authRoutesHelper = require('../helper/auth-routes-helper');
const router = express.Router();

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
                res.status(201).cookie(email, authRoutesHelper.createCookie(email), { httpOnly: true }).send('Valid password.');
            }
            else {
                res.status(401).send('Invalid password.');
            }
        })
        .catch((err) => {
            res.send(err);
        });
});

router.delete('/logout', (req, res) => {

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

    try {
        let hashPassword = authRoutesHelper.createPassword(password, salt);
        
        mysqlConnect.authQuery('INSERT into User(first_name, last_name, email, hash_password, salt, create_date) VALUES (?,?,?,?,?,?)', [ firstName, lastName, email, hashPassword, salt, createDate ])
            .then((result) => {
                res.send(result);
            })
            .catch((err) => {
                res.send(err);
            });
    }
    catch (e) {
        res.send(e);
    }
});

router.post('/forgotpassword', (req, res) => {

});

module.exports = router;