const mongoose = require('mongoose');
const goalController = require('../controllers/goalController');
const { sendEmail, goalReminder } = require('../utils/emailService');

// Ensure environment variables are loaded
require('dotenv').config();

class ReminderService {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;
    
    try {
      const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://satyyam:Satyam2602@lumora.evfvcbf.mongodb.net/lumora?retryWrites=true&w=majority&appName=lumora';
      
      if (!MONGO_URI) {
        throw new Error('MONGO_URI environment variable is not set');
      }
      
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.isConnected = true;
      console.log('Reminder service connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Reminder service disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  async sendDailyReminders() {
    try {
      await this.connect();
      
      const currentTime = new Date();
      console.log('=== Starting daily reminder check ===');
      console.log(`Time: ${currentTime.toLocaleString()}`);
      
      // Get users who need reminders
      const usersNeedingReminders = await goalController.checkReminders(currentTime);
      
      console.log(`Found ${usersNeedingReminders.length} users needing reminders`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of usersNeedingReminders) {
        try {
          // Log the reminder details
          console.log(`\n--- Sending reminder to: ${user.email} ---`);
          console.log(`Goal: ${user.goalData.targetDays} days`);
          console.log(`Progress: ${user.goalData.progress || 0} days`);
          console.log(`Remaining: ${user.goalData.targetDays - (user.goalData.progress || 0)} days`);
          console.log(`Reminder time: ${user.goalData.reminderTime}`);
          
          // Send email notification
          await this.sendEmailNotification(user);
          
          // Mark reminder as sent
          await goalController.markReminderSent(user._id);
          
          console.log(`✅ Email reminder sent successfully to: ${user.email}`);
          successCount++;
          
        } catch (error) {
          console.error(`❌ Error sending reminder to ${user.email}:`, error);
          errorCount++;
        }
      }
      
      console.log(`\n=== Reminder check complete ===`);
      console.log(`✅ Successfully sent: ${successCount} reminders`);
      console.log(`❌ Failed to send: ${errorCount} reminders`);
      console.log(`Total processed: ${usersNeedingReminders.length} users`);
      
    } catch (error) {
      console.error('Error in daily reminder service:', error);
    }
  }

  async sendEmailNotification(user) {
    try {
      // Debug: Check which email configuration is being used
      console.log('🔧 Email configuration check:');
      console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
      console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
      console.log(`   Using Zoho: ${process.env.EMAIL_HOST ? 'Yes' : 'No'}`);
      
      // Calculate progress and remaining days
      const progress = user.goalData.progress || 0;
      const targetDays = user.goalData.targetDays;
      const remainingDays = Math.max(0, targetDays - progress);
      
      // Generate email content using template
      const emailHtml = goalReminder(
        user.email.split('@')[0], // Use email prefix as name
        progress,
        targetDays,
        remainingDays
      );
      
      // Send email using Nodemailer
      const result = await sendEmail({
        to: user.email,
        subject: "📝 Time to Journal!",
        html: emailHtml
      });
      
      if (result.success) {
        console.log(`📧 Email sent successfully to ${user.email}`);
        return result;
      } else {
        console.error(`❌ Failed to send email to ${user.email}:`, result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ Error sending email notification to ${user.email}:`, error);
      throw error;
    }
  }

  // Method to check if it's time to send reminders (9 AM)
  shouldSendReminders() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Send reminders at 9:00 AM
    return hour === 9 && minute === 0;
  }
}

module.exports = new ReminderService(); 