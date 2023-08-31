module.exports = (config) => {
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    const generatePassword = require('generate-password');
    const serverConfig = config.server;

    const HASH_ITERATIONS = 10000;
    const HASH_KEY_LENGTH = 100;
    const HASH_DIGEST = 'sha256';
    const RESET_PASSWORD_EXPIRY_LENGTH_MINS = 30;

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
        return jwt.sign({ data: data }, serverConfig.COOKIE_TOKEN_SECRET, { expiresIn: '1h' });
    };

    /*  This will create a JSON Web Token with the data of a user
    *  @param {User} - A User object 
    *  @return A JSON Web Token string
    */
    let createJWTUserCookie = (userData) => {
        return jwt.sign({ data: userData }, serverConfig.USER_DATA_COOKIE_TOKEN_SECRET, { expiresIn: '1h' });
    }

    let getJWTCookieData = (cookie) => {
        return jwt.verify(cookie, serverConfig.COOKIE_TOKEN_SECRET);
    };

    return {
        createSalt: createSalt,
        createHashPassword: createHashPassword,
        verifyPassword: verifyPassword,
        createJWTAuthCookie: createJWTAuthCookie,
        createJWTUserCookie: createJWTUserCookie,
        getJWTCookieData: getJWTCookieData,
        createResetPasswordDetails: createResetPasswordDetails
    };
}