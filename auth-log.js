let logAuthData = (req, res, next) => {
    console.log('logAuthData');

    next();
};

module.exports = logAuthData;