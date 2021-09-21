const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(
{
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'televonvea@gmail.com',
            pass: 'fwqxotphqqjbnpol'
        },
    },
    {
        from: 'televonvea@gmail.com',
    }

);

const mailer = async message => {
  await transporter.sendMail(message, (err, info) => {
     if (err) return console.log(err);
     console.log('Email send: ', info);
  });
};

module.exports = mailer;