const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const HASH_ITERATIONS = 10000;
const HASH_KEY_LENGTH = 256;
const HASH_DIGEST = 'sha256';

dotenv.config();

let createPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString('base64');
}

let createSalt = () => {
    return crypto.randomBytes(256).toString('base64');
}

let verifyPassword = (password, hashPassword, salt) => {
    return createPassword(password, salt) == hashPassword;
}

let createCookie = (email) => {
    return jwt.sign({ data: email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
}

let verifyCookie = (token, email) => {
    return jwt.verify(token, process.env.TOKEN_SECRET) == email;
}

module.exports = {
    createSalt: createSalt,
    createPassword: createPassword,
    verifyPassword: verifyPassword,
    createCookie: createCookie,
    verifyCookie: verifyCookie
}