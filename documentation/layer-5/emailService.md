# Email Service Documentation

The `emailService.js` file provides comprehensive email functionality for the application, including dynamic transporter creation, retry mechanisms, and bulk email capabilities. It supports both custom SMTP configurations and Gmail fallback, with robust error handling and delivery confirmation.

## Functions

### createTransporter

**Function Overview**
- Dynamically creates email transporter based on environment configuration
- Supports custom SMTP servers (Zoho, etc.) with full configuration options
- Provides Gmail fallback for development and testing
- Configures TLS settings, timeouts, and connection parameters
- Handles secure and non-secure port configurations
- Critical for email delivery infrastructure

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: None
- **Returns**: Nodemailer transporter instance

**Dependencies**
- **Models**: None
- **Utilities**: `nodemailer` for email transport creation
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Requires environment variables for SMTP configuration
- TLS configuration may need adjustment for different providers
- Connection timeouts configured for reliability
- Critical for email delivery functionality

---

### sendEmail

**Function Overview**
- Sends individual emails with comprehensive retry logic
- Implements exponential backoff retry strategy (3 attempts)
- Creates fresh transporter for each attempt to avoid connection issues
- Provides detailed logging for debugging and monitoring
- Returns success/failure status with message ID or error details
- Handles email delivery failures gracefully

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `{ to, subject, html, retries? }`
- **Returns**: Promise<Object> - Success status and message ID or error

**Dependencies**
- **Models**: None
- **Utilities**: `nodemailer` for email sending, `createTransporter` function
- **Services**: Email delivery service (SMTP or Gmail)
- **Other Controllers**: Used by `reminderService.js` and `authController.js`

**Bugs or Development Challenges**
- Retry mechanism with exponential backoff
- Fresh transporter creation for each attempt
- Comprehensive error logging and handling
- Critical for user communication and engagement
- Email delivery reliability is essential for user experience

---

### sendBulkEmail

**Function Overview**
- Sends emails to multiple recipients in sequence
- Processes each recipient individually with error isolation
- Returns results for each recipient (success/failure)
- Maintains individual email delivery tracking
- Useful for mass notifications and announcements
- Handles bulk operations efficiently

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `{ recipients, subject, html }`
- **Returns**: Promise<Array> - Results for each recipient

**Dependencies**
- **Models**: None
- **Utilities**: `sendEmail` function for individual email delivery
- **Services**: Email delivery service
- **Other Controllers**: None

**Bugs or Development Challenges**
- Sequential processing may be slow for large recipient lists
- Individual error handling for each recipient
- No batch processing optimization
- Critical for mass communication features 