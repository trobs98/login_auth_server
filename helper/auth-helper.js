const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const generatePassword = require('generate-password');
const dotenv = require('dotenv');
const mysqlConnect = require('../mysql-connect');
const UserModel = require('../models/user-model');

const HASH_ITERATIONS = 10000;
const HASH_KEY_LENGTH = 100;
const HASH_DIGEST = 'sha256';
const COOKIE_EXPIRY_TIMESTAMP = 631170000;
const RESET_PASSWORD_EXPIRY_LENGTH_MINS = 30;

dotenv.config();

let createHashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString('hex');
};

let createResetPasswordDetails = () => {
    let salt = createSalt();
    let token = createRandomToken();
    let expiration = Math.floor(new Date(Date.now() + RESET_PASSWORD_EXPIRY_LENGTH_MINS * 60000).getTime() / 1000);

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

let createJWTAuthCookie = (data) => {
    return jwt.sign({ data: data }, process.env.COOKIE_TOKEN_SECRET, { expiresIn: '1h' });
};

/*  This will create a JSON Web Token with the data of a user
 *  @param {User} - A User object 
 *  @return A JSON Web Token string
 */
let createJWTUserCookie = (userData) => {
    return jwt.sign({ data: userData }, process.env.USER_DATA_COOKIE_TOKEN_SECRET, { expiresIn: '1h' });
}

let getJWTCookieData = (cookie) => {
    return jwt.verify(cookie, process.env.COOKIE_TOKEN_SECRET);
};

let verifyJWTCookie = (cookie, loginIP) => {
    return new Promise(async (resolve, reject) => {
        let cookieData = getJWTCookieData(cookie);

        try {
            let userAuditData = await mysqlConnect.authQuery('SELECT (SELECT email FROM User WHERE id = FK_userId) AS "email", login_IP, cookie, expiry_date FROM UserAudit WHERE cookie = ?', [ cookie ]);
            
            if (userAuditData.results.length > 0 && 
                userAuditData.results[0].email === cookieData.data && 
                loginIP === userAuditData.results[0].login_IP && 
                cookieData.exp >= Math.floor(new Date(Date.now()).getTime() / 1000)) {
                    resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (err) {
            reject(err);
        }
    });
};

let expireJWTCookie = (cookieToken) => {
    return new Promise ((resolve, reject) => {
        mysqlConnect.authQuery('UPDATE UserAudit SET expiry_date = ? WHERE cookie = ?', [ COOKIE_EXPIRY_TIMESTAMP, cookieToken ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let logLoginRequest = (cookie, loginIP) => {
    return new Promise((resolve, reject) => {
        let cookieData = getJWTCookieData(cookie);
        
        mysqlConnect.authQuery('INSERT INTO UserAudit(FK_userId, login_date, login_IP, cookie, expiry_date) VALUES ((SELECT id FROM User WHERE email = ? LIMIT 1),?,?,?,?)', [ cookieData.data, cookieData.iat, loginIP, cookie, cookieData.exp ])
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
            let hashToken = createHashPassword(resetPassDetails.token, resetPassDetails.salt);
    
            // Delete the temp token for the user if they already have one, so users can only have 1 token at a time
            await deleteTempTokenByEmail(email);
            await insertTempToken(email, hashToken, resetPassDetails.salt, resetPassDetails.expiration);
    
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

let deleteTempTokenByEmail = (email) => {
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

let deleteTempTokenByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('DELETE FROM ResetPasswordToken WHERE FK_userId = ?', [ userId ])
            .then((result) => {
                resolve(result);
            })
            .catch((err) => {
                reject(err);
            })
    });
};

let getTempTokenByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        mysqlConnect.authQuery('SELECT * FROM ResetPasswordToken WHERE Fk_userId = ?', [ userId ])
            .then((result) => {
                if (result.results.length > 0) {
                    resolve({
                        hashToken: result.results[0].hash_token,
                        salt: result.results[0].salt,
                        expiration: result.results[0].expiration_date
                    });
                }
                else {
                    resolve(null);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let verifyTempToken = (userId, token) => {
    return new Promise (async (resolve, reject) => {
        try {
            let hashTokenData = await getTempTokenByUserId(userId);

            if (hashTokenData && createHashPassword(token, hashTokenData.salt) === hashTokenData.hashToken && hashTokenData.expiration >= Math.floor(new Date(Date.now()).getTime() / 1000)) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (err) {
            reject(err);
        }
    });
};

let getUserInfoByEmail = (email) => {
    return new Promise((resolve, reject) => {
        if (!email) {
            resolve(null);
        }

        mysqlConnect.authQuery('SELECT * FROM User WHERE email = ? LIMIT 1', [ email ])
            .then((result) => {
                if (result.results.length > 0) {
                    resolve(new UserModel(result.results[0].id, result.results[0].email, result.results[0].first_name, result.results[0].last_name, result.results[0].create_date, result.results[0].hash_password, result.results[0].salt));
                }
                else {
                    resolve(null);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

let insertNewUser = (firstName, lastName, email, hashPassword, salt, createDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await mysqlConnect.authQuery('INSERT into User(first_name, last_name, email, hash_password, salt, create_date) VALUES (?,?,?,?,?,?)', [ firstName, lastName, email, hashPassword, salt, createDate ]));
        }
        catch(err) {
            reject(err);
        }
    });
}

let updateUserPasswordById = (hashPassword, salt, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await mysqlConnect.authQuery('UPDATE User SET hash_password = ?, salt = ? WHERE id = ?', [ hashPassword, salt, userId ]));
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    createSalt: createSalt,
    createHashPassword: createHashPassword,
    verifyPassword: verifyPassword,
    createJWTAuthCookie: createJWTAuthCookie,
    createJWTUserCookie: createJWTUserCookie,
    getJWTCookieData: getJWTCookieData,
    verifyJWTCookie: verifyJWTCookie,
    expireJWTCookie: expireJWTCookie,
    logLoginRequest: logLoginRequest,
    generateTempToken: generateTempToken,
    deleteTempTokenByUserId: deleteTempTokenByUserId,
    verifyTempToken: verifyTempToken,
    getUserInfoByEmail: getUserInfoByEmail,
    insertNewUser: insertNewUser,
    updateUserPasswordById: updateUserPasswordById
}