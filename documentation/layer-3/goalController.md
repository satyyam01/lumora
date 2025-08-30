# Goal Controller Documentation

The `goalController.js` file manages user journaling goals, including goal setting, progress tracking, reminder management, and automated reminder checking. It integrates with the journaling system to track user progress and send timely reminders.

## Functions

### setGoal

**Function Overview**
- Sets or updates a user's journaling goal with target days and reminder preferences
- Validates target days (1-365 range) and reminder time format
- Calculates goal start and end dates automatically
- Sets default reminder time to 09:00 if not specified
- Enables reminders by default
- Uses `updateOne` to avoid root-level validation issues

**API Details**
- **Endpoint**: `POST /api/goals`
- **Access Control**: Authenticated users only
- **Request Body**: `{ targetDays, reminderTime?, reminderEnabled? }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for goal data updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Uses `updateOne` to avoid root-level validation issues
- Reminder time validation enforces 30-minute intervals
- Goal dates are calculated from today's date

---

### getGoal

**Function Overview**
- Retrieves the user's current active goal with progress information
- Calculates progress based on journal entries during the goal period
- Automatically deactivates completed or expired goals
- Returns comprehensive goal data including progress, completion status, and remaining days
- Handles goal expiration logic

**API Details**
- **Endpoint**: `GET /api/goals`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` for goal data, `JournalEntry` for progress calculation
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex progress calculation logic
- Automatic goal deactivation for completed/expired goals
- Date-based progress tracking with timezone considerations

---

### cancelGoal

**Function Overview**
- Cancels the user's current active goal
- Sets the goal as inactive without deleting goal data
- Preserves goal history for future reference
- Uses `updateOne` to avoid validation issues

**API Details**
- **Endpoint**: `DELETE /api/goals`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for goal deactivation
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Uses `updateOne` to avoid root-level validation issues
- Goal data is preserved but marked as inactive

---

### updateReminderSettings

**Function Overview**
- Updates user's reminder time and enabled/disabled status
- Validates reminder time format (HH:MM with 30-minute intervals)
- Allows partial updates of reminder settings
- Returns updated reminder configuration

**API Details**
- **Endpoint**: `PUT /api/goals/reminders`
- **Access Control**: Authenticated users only
- **Request Body**: `{ reminderTime?, reminderEnabled? }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for reminder settings updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Reminder time validation enforces 30-minute intervals
- Partial updates supported for flexible configuration

---

### checkReminders

**Function Overview**
- Checks which users need reminders for their journaling goals
- Converts current time to IST timezone for consistent checking
- Identifies users with active goals who haven't journaled today
- Prevents duplicate reminders on the same day
- Checks if current time is within 30 minutes of user's preferred reminder time
- Designed for daily cron job execution

**API Details**
- **Endpoint**: N/A (internal function for cron jobs)
- **Access Control**: N/A (internal function)
- **Parameters**: `currentTime` (defaults to current date)

**Dependencies**
- **Models**: `User` for goal data, `JournalEntry` for today's entry checking
- **Utilities**: `moment-timezone` for timezone handling
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex timezone handling between IST and UTC
- 30-minute window for reminder timing
- Prevents duplicate reminders on the same day
- Hardcoded IST timezone ('Asia/Kolkata')

---

### markReminderSent

**Function Overview**
- Marks a reminder as sent for a specific user
- Updates the `lastReminderSent` timestamp
- Prevents duplicate reminders for the same user
- Called after successfully sending a reminder

**API Details**
- **Endpoint**: N/A (internal function)
- **Access Control**: N/A (internal function)
- **Parameters**: `userId`

**Dependencies**
- **Models**: `User` model for reminder timestamp updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Simple timestamp update function
- Error handling logs issues but doesn't throw exceptions 