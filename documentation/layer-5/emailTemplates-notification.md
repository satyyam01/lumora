# Goal Reminder Email Template Documentation

The `notification.js` file provides HTML email templates for goal reminder notifications. It creates engaging, motivational email content with progress tracking, visual progress bars, and call-to-action buttons to encourage user engagement with their journaling goals.

## Functions

### goalReminder

**Function Overview**
- Generates HTML email content for goal reminder notifications
- Creates responsive email layout with Lumora branding and gradient design
- Displays user progress with visual progress bar
- Shows completion statistics and remaining days
- Includes call-to-action button linking to journal entry page
- Provides motivational messaging to encourage continued journaling
- Critical for user engagement and goal completion

**API Details**
- **Endpoint**: N/A (internal template function)
- **Access Control**: N/A (internal function)
- **Parameters**: `userName` (string), `progress` (number), `targetDays` (number), `remainingDays` (number)
- **Returns**: String - Complete HTML email content

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: None
- **Other Controllers**: Used by `reminderService.js` for goal reminder emails

**Bugs or Development Challenges**
- Dynamic progress bar calculation and styling
- Responsive design for mobile email clients
- Call-to-action button linking to application
- Progress statistics display and formatting
- Critical for user engagement and goal tracking
- Email template consistency and branding 