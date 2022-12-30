const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const generatePassword = require('generate-password');
const dotenv = require('dotenv');
const mysqlConnect = require('../mysql-connect');
const userModel = require('../models/user-model');

const HASH_ITERATIONS = 10000;
const HASH_KEY_LENGTH = 100;
const HASH_DIGEST = 'sha256';

dotenv.config();

let createHashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString('hex');
};

let createResetPasswordDetails = () => {
    let salt = createSalt();
    let token = createRandomToken();
    let expiration = Math.floor(new Date(Date.now() + 30 * 60000).getTime() / 1000);

    return { salt: salt, token: token, expiration: expiration };
};

let createRandomToken = () => {
    return generatePassword.generate({ length: 25, numbers: true, uppercase: true, lowercase: true });
};

let createSalt = () => {
    return crypto.randomBytes(64).toString('hex');
};

let verifyPassword = (password, hashPassword, salt) => {
    return createHashPassword(password, salt) == hashPassword;
};

let createCookie = (email) => {
    return jwt.sign({ data: email }, process.env.COOKIE_TOKEN_SECRET, { expiresIn: '1h' });
};

let verifyCookie = (token, email) => {
    return jwt.verify(token, process.env.COOKIE_TOKEN_SECRET) == email;
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

let generateTempToken = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let resetPassDetails = createResetPasswordDetails();
            let token = createHashPassword(resetPassDetails.token, resetPassDetails.salt);
    
            await deleteTempToken(email);
            await insertTempToken(email, token, resetPassDetails.salt, resetPassDetails.expiration);
    
            resolve({
                token: resetPassDetails.token,
                expiration: resetPassDetails.expiration
            });
        }
        catch(err) {
            reject(err);
        }
    });
};

let insertTempToken = (email, hashToken, salt, expiration) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('INSERT INTO ResetPasswordToken (FK_userId, hash_token, salt, expiration_date) VALUES ((SELECT id FROM User WHERE email = ? LIMIT 1),?,?,?)', [ email, hashToken, salt, expiration ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let deleteTempToken = (email) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('DELETE FROM ResetPasswordToken WHERE FK_userId = (SELECT id FROM User WHERE email = ?)', [ email ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

let getUserInfoByEmail = (email) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('SELECT * FROM User WHERE email = ?', [ email ])
            .then((result) => {
                resolve(new userModel(result.results[0].id, result.results[0].email, result.results[0].first_name, result.results[0].last_name, result.results[0].create_date, result.results[0].hash_password, result.results[0].salt));
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = {
    createSalt: createSalt,
    createHashPassword: createHashPassword,
    verifyPassword: verifyPassword,
    createCookie: createCookie,
    verifyCookie: verifyCookie,
    logLoginRequest: logLoginRequest,
    generateTempToken: generateTempToken,
    getUserInfoByEmail: getUserInfoByEmail
}