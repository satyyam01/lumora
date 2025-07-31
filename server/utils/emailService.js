const nodemailer = require('nodemailer');
const { otpVerification } = require('./emailTemplates/otp');
const { goalReminder } = require('./emailTemplates/notification');

// Create transporter dynamically based on current environment variables
function createTransporter() {
  if (process.env.EMAIL_HOST) {
    // Use custom SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false, // For development/testing
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000      // 60 seconds
    });
  } else {
    // Fallback to Gmail for testing
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
      }
    });
  }
}

async function sendEmail({ to, subject, html, retries = 3 }) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"Lumora" <${process.env.EMAIL_USER || 'noreply@lumora.com'}>`,
        to,
        subject,
        html
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully (attempt ${attempt}):`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email sending error (attempt ${attempt}/${retries}):`, error.message);
      if (attempt === retries) {
        console.error('❌ All email retry attempts failed');
        return { success: false, error: error.message };
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function sendBulkEmail({ recipients, subject, html }) {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html
    });
    results.push({ recipient, ...result });
  }
  return results;
}

module.exports = {
  sendEmail,
  sendBulkEmail,
  otpVerification,
  goalReminder,
  createTransporter
}; 