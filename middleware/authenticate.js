let authRequest = (req, res, next) => {
    if (req.baseUrl !== '/') {
        //let cookieHeader = req.getHeader('set-cookie').split(/[=;]+/);

        console.log('req: ', req.cookies);
    }

    next();
}

module.exports = authRequest;