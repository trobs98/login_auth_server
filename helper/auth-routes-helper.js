const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const generatePassword = require('generate-password');
const dotenv = require('dotenv');
const mysqlConnect = require('../mysql-connect');

const HASH_ITERATIONS = 10000;
const HASH_KEY_LENGTH = 100;
const HASH_DIGEST = 'sha256';
const EXPIRED_DATE = 0;

dotenv.config();

let createHashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString('base64');
};

let createResetPasswordDetails = () => {
    let salt = createSalt();
    let password = createRandomPassword();
    let expiration = Math.floor(new Date(Date.now() + 30 * 60000).getTime() / 1000);

    return { salt: salt, password: password, expiration: expiration };
};

let createRandomPassword = () => {
    return generatePassword.generate({ length: 10, numbers: true, symbols: true });
};

let createSalt = () => {
    return crypto.randomBytes(256).toString('base64');
};

let verifyPassword = (password, hashPassword, salt) => {
    return createHashPassword(password, salt) == hashPassword;
};

let createCookie = (email) => {
    return jwt.sign({ data: email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
};

let verifyCookie = (token, email) => {
    return jwt.verify(token, process.env.TOKEN_SECRET) == email;
};

let logLoginRequest = (email, cookie, loginIP) => {
    return new Promise((resolve, reject) => {
        let loginDate = Date.now();
        
        mysqlConnect.authQuery('INSERT INTO UserAudit(FK_userId, login_date, login_IP, cookie) VALUES ((SELECT id FROM User WHERE email = ? LIMIT 1),?,?,?)', [ email, loginDate, loginIP, cookie ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let validateTempPassword = (email) => {
    return new Promise((resolve, reject) => {
        expireValidTempPassword(email)
            .then((result) => {
                let resetPassDetails = createResetPasswordDetails();
                insertTempPassword(email, createHashPassword(resetPassDetails.password, resetPassDetails.salt), resetPassDetails.salt, resetPassDetails.expiration)
                    .then((result) => {
                        resolve({
                            password: resetPassDetails.password,
                            expiration: resetPassDetails.expiration
                        })
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let insertTempPassword = (email, hashPassword, salt, expiration) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('INSERT INTO ResetPassword (FK_userId, hash_password, salt, expiration_date) VALUES ((SELECT id FROM User WHERE email = ? LIMIT 1),?,?,?)', [ email, hashPassword, salt, expiration ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let expireValidTempPassword = (email) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('UPDATE ResetPassword SET expiration_date = ? WHERE FK_userId = (SELECT id FROM User WHERE email = ?)', [ EXPIRED_DATE, email ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

module.exports = {
    createSalt: createSalt,
    createHashPassword: createHashPassword,
    verifyPassword: verifyPassword,
    createCookie: createCookie,
    verifyCookie: verifyCookie,
    logLoginRequest: logLoginRequest,
    validateTempPassword: validateTempPassword
}