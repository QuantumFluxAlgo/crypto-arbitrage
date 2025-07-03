const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const recipient = process.env.ALERT_RECIPIENT;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

async function sendEmail(subject, body) {
  if (!user || !pass || !recipient) {
    throw new Error('SMTP credentials not set');
  }

  const mailOptions = {
    from: user,
    to: recipient,
    subject,
    text: body,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmail,
};
