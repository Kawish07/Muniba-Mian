const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kawishiqbal898@gmail.com',
    pass: 'Kawishayyan07@@@@'
  }
});

async function sendNotificationEmail({ subject, text, html }) {
  const mailOptions = {
    from: 'kawishiqbal898@gmail.com',
    to: 'kawishiqbal898@gmail.com',
    subject,
    text,
    html
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendNotificationEmail };
