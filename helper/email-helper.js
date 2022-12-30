const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const emailTemplatePaths = {
    'forgotPassword': '../email_template/forgot-pass-email.html'
}

let getForgotPasswordEmail = (userId, name, clientUrl, token, expirationDate) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(__dirname, emailTemplatePaths.forgotPassword), { encoding: 'utf-8' }, (err, html) => {
            if (err) {
                reject(err);
            }
    
            let template = handlebars.compile(html);
            let replacements = {
                userId: userId,
                name: name,
                clientUrl: clientUrl,
                token: token,
                expirationDate: expirationDate
            };
    
            resolve(template(replacements));
        });
    })
};

module.exports = {
    getForgotPasswordEmail: getForgotPasswordEmail,
    emailTemplatePaths: emailTemplatePaths
};