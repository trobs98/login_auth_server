const config = require('../config/config');
const { createHashPassword, createSalt } = require('../helper/auth-helper')(config);

let password = process.argv[2];

try {
    if (!password) {
        throw new Error('No password provided.');
    }

    let salt = createSalt();
    let passwordHash = createHashPassword(password, salt);

    console.log('Provided Password: ', password);
    console.log('Salt: ', salt);
    console.log('Password Hash: ', passwordHash);

    return {
        password: password,
        salt: salt,
        password_hash: passwordHash
    }
} 
catch(err) {
    throw err;
}