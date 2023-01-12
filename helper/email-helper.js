const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const nodemailer = require('nodemailer');
const emailConfig = require('../config/email-config');

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

let sendHTMLEmail = async (toEmailAddress, emailSubject, emailHTML) => {
    let transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
            user: emailConfig.auth.user,
            pass: emailConfig.auth.pass
        }
    });

    return await transporter.sendMail({
        from: emailConfig.auth.user,
        to: toEmailAddress,
        subject: emailSubject,
        html: emailHTML
    });
};

module.exports = {
    getForgotPasswordEmail: getForgotPasswordEmail,
    sendHTMLEmail: sendHTMLEmail,
    emailTemplatePaths: emailTemplatePaths
};