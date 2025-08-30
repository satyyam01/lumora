# Hardcoded Database Connection String

## Problem Description
The reminder service contains a hardcoded MongoDB connection string with actual database credentials embedded in the source code. This is a critical security vulnerability that exposes database credentials and could lead to unauthorized database access.

## Discovery Method
This was likely discovered during a security code review or when the code was shared with other developers. The hardcoded credentials would be immediately visible to anyone with access to the source code, making it an obvious security issue.

## Code Location
```javascript
// server/services/reminderService.js - line 18
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://satyyam:Satyam2602@lumora.evfvcbf.mongodb.net/lumora?retryWrites=true&w=majority&appName=lumora';
```

## Why It's a Problem
- **Credential Exposure**: Database username and password are visible in source code
- **Version Control Risk**: Credentials get committed to Git history and shared repositories
- **Access Control**: Anyone with code access can see database credentials
- **Deployment Risk**: Same credentials used across all environments
- **Security Breach**: Compromises the entire database if credentials are leaked

## Likely Fix
```javascript
// Remove hardcoded fallback and require environment variable
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}
```

## Why This Fix Works
- **Environment-Based**: Credentials are stored in environment variables, not source code
- **Secure Storage**: Environment variables can be managed securely through deployment tools
- **No Fallback**: Forces proper configuration instead of allowing insecure defaults
- **Deployment Flexibility**: Different credentials for different environments
- **Security Best Practice**: Follows the principle of never committing secrets to source code

## Lesson Learned
**Never hardcode credentials or secrets in source code.** This taught me the critical importance of proper secrets management and the dangers of taking shortcuts during development. I now always use environment variables for sensitive configuration and implement proper error handling when required environment variables are missing. This experience also reinforced the importance of security code reviews and the value of automated security scanning tools.

## Additional Security Improvements
- Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Implement proper environment variable validation
- Add security scanning to CI/CD pipeline
- Use different credentials for development, staging, and production
- Implement database connection encryption and authentication 