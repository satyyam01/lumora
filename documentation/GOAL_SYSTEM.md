# Goal System Documentation

## Overview

The Goal System is a comprehensive feature that allows users to set journaling goals and receive daily reminders to maintain consistency. It includes goal setting, progress tracking, and automated reminder functionality.

## Features

### 🎯 Goal Setting
- Set custom journaling goals (1-365 days)
- Quick preset options (7, 14, 21, 30, 60, 90 days)
- Visual goal preview with end date calculation
- Goal validation and error handling

### 📊 Progress Tracking
- Real-time progress visualization
- Progress bar with percentage completion
- Days remaining calculation
- Goal status indicators (In Progress, Completed, Expired)

### 🔔 Daily Reminders
- Automated reminders at 9 AM daily
- Only sends reminders if user hasn't journaled today
- Prevents duplicate reminders on the same day
- Configurable reminder timing

### 🎨 User Interface
- Beautiful goal progress cards
- Modal-based goal setting interface
- Responsive design with dark mode support
- Intuitive progress indicators

## Technical Architecture

### Backend Components

#### 1. User Model Extension (`server/models/User.js`)
```javascript
goalData: {
  targetDays: { type: Number, default: 7 },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  isActive: { type: Boolean, default: false },
  lastReminderSent: { type: Date, default: null }
}
```

#### 2. Goal Controller (`server/controllers/goalController.js`)
- `setGoal()` - Create or update user goals
- `getGoal()` - Retrieve current goal with progress
- `cancelGoal()` - Deactivate current goal
- `checkReminders()` - Find users needing reminders
- `markReminderSent()` - Mark reminder as sent

#### 3. Goal Routes (`server/routes/goalRoutes.js`)
- `POST /api/goals/set` - Set new goal
- `GET /api/goals/current` - Get current goal
- `DELETE /api/goals/cancel` - Cancel goal

#### 4. Reminder Service (`server/services/reminderService.js`)
- Automated reminder checking
- Notification system integration
- MongoDB connection management
- Error handling and logging

### Frontend Components

#### 1. Goal Hook (`client/src/hooks/useGoal.js`)
- Goal data management
- API integration
- Loading and error states
- Real-time updates

#### 2. Goal Modal (`client/src/components/GoalModal.jsx`)
- Goal setting interface
- Quick preset buttons
- Form validation
- Success/error handling

#### 3. Goal Progress Card (`client/src/components/GoalProgressCard.jsx`)
- Progress visualization
- Goal status display
- Action buttons (cancel, set new goal)
- Responsive design

## API Endpoints

### Set Goal
```http
POST /api/goals/set
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetDays": 30
}
```

**Response:**
```json
{
  "message": "Goal set successfully",
  "goal": {
    "targetDays": 30,
    "startDate": "2024-07-31T00:00:00.000Z",
    "endDate": "2024-08-29T23:59:59.999Z",
    "isActive": true,
    "lastReminderSent": null
  }
}
```

### Get Current Goal
```http
GET /api/goals/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "goal": {
    "targetDays": 30,
    "startDate": "2024-07-31T00:00:00.000Z",
    "endDate": "2024-08-29T23:59:59.999Z",
    "isActive": true,
    "progress": 5,
    "isCompleted": false,
    "isExpired": false,
    "remainingDays": 25
  }
}
```

### Cancel Goal
```http
DELETE /api/goals/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Goal cancelled successfully"
}
```

## Goal Logic

### Goal Calculation
1. **Start Date**: Set to today (midnight)
2. **End Date**: Start date + (target days - 1) days (end of day)
3. **Progress**: Count of unique days with journal entries during goal period
4. **Completion**: Progress >= target days
5. **Expiration**: Current date > end date

### Reminder Logic
1. **Check Time**: Daily at 9 AM
2. **Eligibility**: User has active goal AND hasn't journaled today
3. **Duplicate Prevention**: Only send once per day per user
4. **Auto-deactivation**: Goals are deactivated when completed or expired

## Usage Examples

### Setting a Goal
```javascript
import useGoal from '../hooks/useGoal';

const { setNewGoal } = useGoal();

// Set a 30-day goal
await setNewGoal(30);
```

### Displaying Goal Progress
```javascript
import GoalProgressCard from '../components/GoalProgressCard';

// In your component
<GoalProgressCard />
```

### Setting Goals via Modal
```javascript
import GoalModal from '../components/GoalModal';

<GoalModal 
  onSuccess={handleGoalSet}
  trigger={<Button>Set Goal</Button>}
/>
```

## Reminder System Setup

### Manual Testing
```bash
# Test the reminder system
node server/scripts/sendReminders.js

# Test goal system functionality
node server/scripts/testGoalSystem.js
```

### Production Setup
For production, you'll need to set up a cron job or scheduled task:

#### Using Cron (Linux/Mac)
```bash
# Add to crontab (runs daily at 9 AM)
0 9 * * * cd /path/to/lumora/server && node scripts/sendReminders.js
```

#### Using Windows Task Scheduler
1. Create a batch file: `send-reminders.bat`
2. Schedule it to run daily at 9 AM
3. Point to: `node server/scripts/sendReminders.js`

#### Using Node.js Cron Package
```javascript
const cron = require('node-cron');
const reminderService = require('./services/reminderService');

// Run daily at 9 AM
cron.schedule('0 9 * * *', () => {
  reminderService.sendDailyReminders();
});
```

## Notification Integration

The reminder system is designed to be easily integrated with various notification services:

### Email Notifications
```javascript
// Using SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@lumora.com',
  subject: "Don't forget to journal today! 📝",
  text: `Hi there! You're on day ${progress} of your ${targetDays}-day journaling goal. Don't break your streak!`
});
```

### Push Notifications
```javascript
// Using Firebase Cloud Messaging
const admin = require('firebase-admin');

await admin.messaging().send({
  token: user.pushToken,
  notification: {
    title: "Time to Journal! 📝",
    body: `Keep your ${targetDays}-day goal on track`
  }
});
```

### SMS Notifications
```javascript
// Using Twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: "Don't forget to journal today! 📝",
  from: process.env.TWILIO_PHONE_NUMBER,
  to: user.phone
});
```

## Error Handling

### Common Issues
1. **Invalid target days**: Must be between 1-365
2. **Database connection**: MongoDB connection errors
3. **Authentication**: Invalid or expired tokens
4. **Date calculations**: Timezone-related issues

### Error Responses
```json
{
  "message": "Target days must be between 1 and 365"
}
```

## Future Enhancements

### Planned Features
1. **Goal Templates**: Pre-defined goal categories
2. **Social Goals**: Share goals with friends
3. **Goal Streaks**: Track consecutive goal completions
4. **Custom Reminder Times**: User-defined reminder schedules
5. **Goal Analytics**: Detailed progress insights
6. **Goal Sharing**: Social media integration

### Technical Improvements
1. **Real-time Updates**: WebSocket integration
2. **Offline Support**: Service worker caching
3. **Performance**: Goal data caching
4. **Scalability**: Redis for reminder queuing

## Testing

### Unit Tests
```bash
# Test goal controller functions
npm test -- --testPathPattern=goalController

# Test goal hooks
npm test -- --testPathPattern=useGoal
```

### Integration Tests
```bash
# Test goal API endpoints
npm test -- --testPathPattern=goalRoutes

# Test reminder system
npm test -- --testPathPattern=reminderService
```

### Manual Testing
1. Set a goal through the UI
2. Create journal entries to track progress
3. Test goal completion scenarios
4. Verify reminder system functionality

## Security Considerations

1. **Authentication**: All goal endpoints require valid JWT tokens
2. **Authorization**: Users can only access their own goals
3. **Input Validation**: Strict validation for goal parameters
4. **Rate Limiting**: Prevent abuse of goal-setting endpoints
5. **Data Privacy**: Goal data is user-specific and private

## Performance Considerations

1. **Database Indexing**: Index on `goalData.isActive` and `goalData.endDate`
2. **Caching**: Cache goal data for frequently accessed users
3. **Batch Processing**: Process reminders in batches for large user bases
4. **Connection Pooling**: Efficient MongoDB connection management

## Monitoring

### Key Metrics
1. **Goal Completion Rate**: Percentage of users completing goals
2. **Reminder Effectiveness**: Journal entries after reminders
3. **System Performance**: API response times
4. **Error Rates**: Failed goal operations

### Logging
```javascript
// Example logging in goal controller
console.log(`Goal set for user ${userId}: ${targetDays} days`);
console.log(`Goal completed for user ${userId}: ${progress}/${targetDays} days`);
```

## Support

For issues or questions about the goal system:
1. Check the error logs in the server console
2. Verify MongoDB connection and data integrity
3. Test the reminder system manually
4. Review goal calculation logic for edge cases 