const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options (to, subject, text, html)
 * @returns {Promise} - Nodemailer send response
 */
const sendEmail = async (options) => {
  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass
    }
  });

  // Define email options
  const mailOptions = {
    from: `${config.email.from}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);

  console.log(`Email sent: ${info.messageId}`);
  
  return info;
};

module.exports = sendEmail;