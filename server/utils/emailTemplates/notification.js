function goalReminder(userName, progress, targetDays, remainingDays) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Time to Journal!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .progress-bar { background: #e0e0e0; border-radius: 20px; height: 20px; margin: 20px 0; }
        .progress-fill { background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; border-radius: 20px; transition: width 0.3s; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Don't let your streak break!</h1>
        </div>
        <div class="content">
          <h2>Hi there!</h2>
          <p>It's time for your daily journaling session</p>
          <h3>Your Progress</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(progress / targetDays) * 100}%"></div>
          </div>
          <p><strong>${progress} of ${targetDays} days completed</strong></p>
          <p>Let's keep it going!</p>
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/journals" class="cta-button">
              Write Today's Entry ✍️
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Keep up the great work! Every entry brings you closer to your goal.
          </p>
        </div>
        <div class="footer">
          <p>This reminder was sent by Lumora - Your Personal Journaling Companion</p>
          <p>You can manage your reminder settings in your Lumora dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { goalReminder }; 