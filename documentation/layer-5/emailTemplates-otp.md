# OTP Email Template Documentation

The `otp.js` file provides HTML email templates for OTP (One-Time Password) verification during user registration and email change processes. It creates responsive, branded email content with embedded styling for consistent delivery across email clients.

## Functions

### otpVerification

**Function Overview**
- Generates HTML email content for OTP verification
- Creates responsive email layout with Lumora branding
- Includes embedded CSS for consistent styling across email clients
- Displays OTP code prominently with visual emphasis
- Provides user-friendly messaging and instructions
- Includes security notice for unintended recipients
- Critical for user account verification and security

**API Details**
- **Endpoint**: N/A (internal template function)
- **Access Control**: N/A (internal function)
- **Parameters**: `userName` (string), `otp` (string)
- **Returns**: String - Complete HTML email content

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: None
- **Other Controllers**: Used by `authController.js` for OTP emails

**Bugs or Development Challenges**
- Embedded CSS for email client compatibility
- Responsive design for mobile email clients
- OTP code visual emphasis and readability
- Critical for user account security and verification
- Email template consistency across different email clients 