const nodemailer = require('nodemailer');
require('dotenv').config();
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

const sendMail = (name, email, subject, text, cb) => {
    const mailOptions = {
        sender: name,
        from: email,
        to: process.env.EMAIL,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });
}

// Exporting the sendmail
module.exports = sendMail;