# Reminder Service Documentation

The `reminderService.js` file manages automated email reminders for users with active journaling goals. It provides a service layer for checking user reminder needs, sending personalized email notifications, and managing the reminder lifecycle. The service integrates with the goal system and email infrastructure to ensure timely user engagement.

## Functions

### constructor

**Function Overview**
- Initializes the ReminderService class instance
- Sets initial connection state to false
- Prepares the service for database connections
- Manages service lifecycle and state tracking

**API Details**
- **Endpoint**: N/A (class constructor)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: ReminderService instance

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard class initialization pattern

---

### connect

**Function Overview**
- Establishes MongoDB connection for the reminder service
- Checks if already connected to avoid duplicate connections
- Uses environment variables for database configuration
- Handles connection errors and provides detailed logging
- Sets connection state for service management
- Critical for database operations and user data access

**API Details**
- **Endpoint**: N/A (internal service method)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: Promise<void> - Connection establishment

**Dependencies**
- **Models**: None
- **Utilities**: `mongoose` for database connection
- **Services**: MongoDB database (external service)
- **Other Controllers**: None

**Bugs or Development Challenges**
- Requires `MONGO_URI` environment variable
- Fallback to hardcoded connection string (security concern)
- Connection timeout and error handling
- Critical for service functionality

---

### disconnect

**Function Overview**
- Safely closes MongoDB connection when service is no longer needed
- Checks connection state before attempting disconnection
- Handles disconnection errors gracefully
- Updates service state to reflect disconnected status
- Ensures clean service shutdown

**API Details**
- **Endpoint**: N/A (internal service method)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: Promise<void> - Disconnection completion

**Dependencies**
- **Models**: None
- **Utilities**: `mongoose` for database disconnection
- **Services**: MongoDB database (external service)
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard disconnection pattern with error handling

---

### sendDailyReminders

**Function Overview**
- Main service method for processing daily reminder checks
- Connects to database and retrieves users needing reminders
- Processes each user individually with error isolation
- Sends personalized email notifications
- Marks reminders as sent to prevent duplicates
- Provides comprehensive logging and success/error tracking
- Designed for cron job execution

**API Details**
- **Endpoint**: N/A (internal service method)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: Promise<void> - Reminder processing completion

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: MongoDB connection, email service
- **Other Controllers**: `goalController.js` for reminder checking and marking

**Bugs or Development Challenges**
- Complex error handling and user isolation
- Database connection management
- Email delivery reliability and retry logic
- Critical for user engagement and goal completion
- Comprehensive logging for debugging and monitoring

---

### sendEmailNotification

**Function Overview**
- Sends personalized reminder emails to individual users
- Generates email content using goal reminder templates
- Calculates user progress and remaining days
- Handles email configuration and delivery
- Provides detailed logging for debugging
- Ensures email delivery success tracking

**API Details**
- **Endpoint**: N/A (internal service method)
- **Access Control**: N/A (internal function)
- **Parameters**: `user` (Object) - User object with goal data
- **Returns**: Promise<Object> - Email sending result

**Dependencies**
- **Models**: None
- **Utilities**: `emailService.js` for email delivery
- **Services**: Email delivery service
- **Other Controllers**: None

**Bugs or Development Challenges**
- Email configuration debugging and validation
- Template generation with dynamic data
- Email delivery success tracking
- Critical for user engagement and retention

---

### shouldSendReminders

**Function Overview**
- Determines if it's time to send daily reminders
- Checks current time against configured reminder schedule
- Hardcoded to 9:00 AM for daily execution
- Used by external cron job schedulers
- Provides time-based trigger for reminder service

**API Details**
- **Endpoint**: N/A (internal service method)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: Boolean - Whether reminders should be sent

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Hardcoded time (9:00 AM) lacks flexibility
- No timezone handling for global deployments
- Simple time comparison may miss execution windows
- Critical for automated reminder scheduling 