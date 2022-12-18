const express = require('express');
const crypto = require('crypto');
const mysqlConnect = require('../mysql-connect');
const router = express.Router();

const HASH_ITERATIONS = 10000;
const HASH_KEY_LENGTH = 256;
const HASH_DIGEST = 'sha256';

router.post('/login', (req, res) => {
    let form = req.body;
    
    let email = form.email;
    let password = form.password;
    mysqlConnect.authQuery('SELECT * FROM User WHERE email = ?', [email])
        .then((results) => {
            


            res.send(results);
            console.log('results: ', results.results);
        })
        .catch((err) => {
            res.send(err);
        });
});

router.post('/signup', (req, res) => {
    let form = req.body;

    let firstName = form.firstName;
    let lastName = form.lastName;
    let email = form.email;
    let password = form.password;
    let salt = crypto.randomBytes(256).toString('base64');
    let createDate = Date.now();

    crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST, (err, derivedKey) => {
        let hashPassword = derivedKey.toString('base64');

        console.log('hash length: ', hashPassword.length);
        console.log('salt length: ', salt.length);

        if (err) {
            res.send(err);
        } else {
            mysqlConnect.authQuery('INSERT into User(first_name, last_name, email, hash_password, salt, create_date) VALUES (?,?,?,?,?,?)', [firstName, lastName, email, hashPassword, salt, createDate])
                .then((result) => {
                    res.send('Successfully signed up!');
                })
                .catch((err) => {
                    res.send(err);
                });
        }
    })
});

module.exports = router;