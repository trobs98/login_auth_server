// TODO : Add middleware to verify all non-session related requests
let authRequest = (req, res, next) => {
    console.log('req.baseUrl: ', req.baseUrl);
    if (req.baseUrl !== '/session') {
        //let cookieHeader = req.getHeader('set-cookie').split(/[=;]+/);

        console.log('req: ', req.cookies);
    }

    next();
}

module.exports = authRequest;