function otpVerification(userName, otp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Lumora</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Verify Your Email</h1>
          <p>Welcome to Lumora!</p>
        </div>
        <div class="content">
          <h2>Hi there!</h2>
          <p>Complete your registration by using the verification code below:</p>
          <div class="otp-code">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you didn't create an account with Lumora, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>Welcome to Lumora - Your Personal Journaling Companion</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { otpVerification }; 