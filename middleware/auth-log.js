const mysqlConnect = require('../mysql-connect');

let logAuthData = (req, res, next) => {
    
    let logLoginRequest = () => {
        
        // Ensure that login is only logged when the path is from login and the login was successful
        if (req.baseUrl + req.path == '/session/login' && res.statusCode === 201) {
            let cookieHeader = res.getHeader('set-cookie').split(/[=;]+/);
            
            let email = cookieHeader[0];
            let cookie = cookieHeader[1];
    
            mysqlConnect.authQuery('SELECT id FROM User WHERE email = ? LIMIT 1', [ email ])
                .then((result) => {
                    let userId = result.results[0].id;
                    let loginDate = Date.now()
                    let loginIP = req.socket.remoteAddress;
    
                    mysqlConnect.authQuery('INSERT INTO UserAudit(FK_userId, login_date, login_IP, cookie) VALUES (?,?,?,?)', [ userId, loginDate, loginIP, cookie ])
                        .then((result) => {
    
                        })
                        .catch((e) => {
    
                        });
                })
                .catch((e) => {
    
                });
        }
    };
    
    res.on('close', logLoginRequest);

    next();
};

module.exports = logAuthData;