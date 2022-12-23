const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');

const emailTemplatePaths = {
    'forgotPassword': '../email_template/forgot-pass-email.html'
}

let getForgotPassEmail = (password, expirationDate) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(__dirname, emailTemplatePaths.forgotPassword), { encoding: 'utf-8' }, (err, html) => {
            console.log('emailTemplatePaths.forgotPassword: ', path.resolve(__dirname, emailTemplatePaths.forgotPassword));
            if (err) {
                reject(err);
            }
    
            let template = handlebars.compile(html);
            let replacements = {
                password: password,
                expirationDate: expirationDate
            };
    
            resolve(template(replacements));
        });
    })
};

module.exports = {
    getForgotPassEmail: getForgotPassEmail,
    emailTemplatePaths: emailTemplatePaths
};