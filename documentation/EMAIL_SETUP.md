# Email Service Setup for Goal Reminders (Nodemailer Only)

## Overview

The goal reminder system uses email notifications to remind users to journal daily. This document explains how to set up email services using only SMTP and Nodemailer (no SendGrid or other external transactional email services).

## Email Service Setup

### SMTP (Custom Server or Gmail)

#### Setup Steps:

1. **Get SMTP Credentials**
   - Host: Your SMTP server (e.g., smtp.gmail.com)
   - Port: Usually 587 (TLS) or 465 (SSL)
   - Username: Your email address
   - Password: Your email password or app password

2. **Set Environment Variables**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLIENT_URL=http://localhost:5173
   ```

#### Gmail (Development/Testing)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-factor authentication

2. **Generate App Password**
   - Go to Security → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Set Environment Variables**
   ```bash
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_app_password
   CLIENT_URL=http://localhost:5173
   ```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | `your_email@gmail.com` |
| `EMAIL_PASS` | SMTP password | `your_app_password` |
| `GMAIL_USER` | Gmail address | `your_email@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app password | `abcd efgh ijkl mnop` |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

## Testing Email Setup

### 1. Test Email Service

```bash
# Test the email service configuration
node -e "require('./utils/emailService').transporter.verify(console.log)"
```

### 2. Test Goal Reminders

```bash
# Test the reminder system
node server/scripts/sendReminders.js
```

### 3. Manual Email Test

Create a test script to send a single email:

```javascript
// test-email.js
const { sendEmail, emailTemplates } = require('./utils/emailService');

async function testEmail() {
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from Lumora',
    html: emailTemplates.goalReminder('Test User', 5, 30, 25)
  });
  
  console.log('Email result:', result);
}

testEmail();
```

## Email Templates

The system includes two email templates:

### 1. Goal Reminder Template
- **Purpose**: Daily reminders to journal
- **Content**: Progress tracking, motivational message, CTA button
- **Features**: Responsive design, progress bar, personalized content

### 2. OTP Verification Template
- **Purpose**: Email verification during signup
- **Content**: OTP code, security notice
- **Features**: Clean design, security-focused messaging

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

### 2. Cron Job Setup

Set up a cron job to run reminders daily:

```bash
# Add to crontab (runs every minute to check for reminders)
* * * * * cd /path/to/lumora/server && node scripts/sendReminders.js
```

### 3. Monitoring

- **Server Logs**: Monitor reminder system logs
- **Error Handling**: Set up alerts for failed email sends

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check SMTP credentials
   - Ensure 2FA is enabled for Gmail
   - Use app password instead of regular password

2. **"Sender not verified"**
   - Verify your sender email with your SMTP provider
   - Check domain authentication

3. **"Email not sending"**
   - Check network connectivity
   - Verify email service configuration
   - Check server logs for errors

### Debug Commands

```bash
# Test email service
node -e "require('./utils/emailService').transporter.verify(console.log)"

# Check environment variables
node -e "console.log('EMAIL_HOST:', process.env.EMAIL_HOST)"
```

## Security Considerations

1. **API Key Security**
   - Never commit credentials to version control
   - Use environment variables
   - Rotate passwords regularly

2. **Email Validation**
   - Validate email addresses before sending
   - Implement rate limiting
   - Handle bounces and spam reports

3. **Data Privacy**
   - Only send emails to verified users
   - Include unsubscribe options
   - Comply with GDPR/CAN-SPAM

## Cost Considerations

- **Gmail**: Free (with limits)
- **Custom SMTP**: Varies by provider

### Recommendations
- Use a reputable SMTP provider for production
- Use Gmail for development/testing
- Monitor email usage and costs

## Support

For email service issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test email configuration manually
4. Contact your email service provider support 