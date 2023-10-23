require('dotenv').config();

const mailgun = require("mailgun-js")({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN})

//  Container for all methods
const mail = {}
mail.send = (agendum, to, link, callback)=>{
    let data;
    if(agendum == 'emailConfirmation'){
        data = {
            from: `${process.env.APP_NAME} <${process.env.MAILGUN_EMAIL}>`,
            to: to,
            subject: 'Email confirmation',
            text: link
            // template: 'email_confirmation',
            // 'v:appName': config.appName,
            // 'v:redirectUrl': link
        }
    }else if(agendum == 'passwordReset'){
        data = {
            from: `${process.env.APP_NAME} <${process.env.MAILGUN_EMAIL}>`,
            to: to,
            subject: 'Password reset',
            text: link
            // template: 'password_recovery',
            // 'v:appName': config.appName,
            // 'v:resetLink': link
        }
    }else{
        callback(err, false)
    }
    mailgun.messages().send(data, (err, body)=>{
        if(!err && body){
            callback(false, body);
        }else{
            callback(err, false)
        }
    })
}

module.exports = mail;