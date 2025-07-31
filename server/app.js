require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const app = express();

// Initialize reminder service
const reminderService = require('./services/reminderService');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

const registrationRoute = require('./routes/registrationRoute');
app.use('/api', registrationRoute);

const journalRoutes = require('./routes/journalRoutes');
app.use('/api/journals', journalRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const goalRoutes = require('./routes/goalRoutes');
app.use('/api/goals', goalRoutes);

const otpStore = require('./utils/otpStore');
otpStore.startCleanupInterval();

// Start reminder service cron job (every 5 minutes, IST)
function startReminderService() {
  // Schedule with node-cron: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Always check time in IST
      const now = new Date();
      await reminderService.sendDailyReminders(now);
    } catch (error) {
      console.error('Error in reminder service:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
  console.log('✅ Reminder service started - checking every 5 minutes (IST)');
}

const port = 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    startReminderService();
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});





