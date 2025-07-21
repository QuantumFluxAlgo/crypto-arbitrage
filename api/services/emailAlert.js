import nodemailer from 'nodemailer';
import logger from './logger.js';

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const recipient = process.env.ALERT_RECIPIENT;
const host = process.env.SMTP_HOST || 'smtp.gmail.com';

logger.info(`Using SMTP host: ${host}`);

const transporter = nodemailer.createTransport({
    host,
  auth: {
    user,
    pass,
  },
});

async function sendEmail(subject, body) {
  if (!user || !pass || !recipient) {
    const reason = 'SMTP credentials not set';
    logger.error(`[ALERT FAILURE] Panic alert email failed to send: ${reason}`);
    throw new Error(reason);
  }

  const mailOptions = {
    from: user,
    to: recipient,
    subject,
    text: body,
  };

    try {
      await transporter.sendMail(mailOptions);
      logger.info('Email alert sent');
    } catch (error) {
      logger.error(`[ALERT FAILURE] Panic alert email failed to send: ${error.message}`);
      throw error;
    }
}

export { sendEmail };
