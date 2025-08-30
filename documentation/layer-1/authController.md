# Auth Controller Documentation

The `authController.js` file handles all authentication-related operations including user registration, login, OTP verification, profile management, and account deletion. It provides secure user authentication with JWT tokens and email verification.

## Functions

### register

**Function Overview**
- Creates a new user account with email and password
- Hashes the password using bcrypt with salt rounds of 10
- Generates a JWT token upon successful registration
- Performs validation to ensure email and password are provided
- Checks for existing users to prevent duplicate registrations

**API Details**
- **Endpoint**: `POST /api/auth/register`
- **Access Control**: Public
- **Request Body**: `{ email, password }`

**Dependencies**
- **Models**: `User` model for database operations
- **Utilities**: `bcrypt` for password hashing, `jwt.js` for token generation
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard error handling with generic server error messages

---

### login

**Function Overview**
- Authenticates existing users with email and password
- Compares provided password with hashed password in database
- Generates a new JWT token upon successful authentication
- Returns appropriate error messages for invalid credentials

**API Details**
- **Endpoint**: `POST /api/auth/login`
- **Access Control**: Public
- **Request Body**: `{ email, password }`

**Dependencies**
- **Models**: `User` model for database queries
- **Utilities**: `bcrypt` for password comparison, `jwt.js` for token generation
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard error handling with generic server error messages

---

### requestOtp

**Function Overview**
- Initiates the OTP-based registration process
- Validates required fields (email, password, name, date of birth)
- Generates a 6-digit random OTP
- Stores pending user data temporarily with OTP
- Sends OTP verification email to the user
- Validates date of birth format

**API Details**
- **Endpoint**: `POST /api/auth/request-otp`
- **Access Control**: Public
- **Request Body**: `{ email, password, name, dob, ...rest }`

**Dependencies**
- **Models**: `User` model for duplicate email checking
- **Utilities**: `otpStore.js` for temporary user storage, `emailService.js` for sending emails
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- OTP generation uses Math.random() which is cryptographically weak for production

---

### verifyOtp

**Function Overview**
- Verifies the OTP sent to the user's email
- Creates the user account in the database upon successful verification
- Hashes the password before storing
- Generates JWT token for immediate login
- Cleans up temporary OTP data

**API Details**
- **Endpoint**: `POST /api/auth/verify-otp`
- **Access Control**: Public
- **Request Body**: `{ email, otp }`

**Dependencies**
- **Models**: `User` model for account creation
- **Utilities**: `bcrypt` for password hashing, `jwt.js` for token generation, `otpStore.js` for OTP verification
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- OTP expiration handling is basic

---

### getProfile

**Function Overview**
- Retrieves the authenticated user's profile information
- Returns only safe fields (name, email, date of birth)
- Excludes sensitive information like password hash

**API Details**
- **Endpoint**: `GET /api/auth/profile`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for profile retrieval
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard authentication middleware dependency

---

### updateName

**Function Overview**
- Updates the authenticated user's name
- Validates name length (minimum 2 characters)
- Returns updated profile information
- Uses MongoDB's `runValidators` for schema validation

**API Details**
- **Endpoint**: `PUT /api/auth/update-name`
- **Access Control**: Authenticated users only
- **Request Body**: `{ name }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for profile updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Name validation is basic (only length check)

---

### startEmailChange

**Function Overview**
- Initiates the email change process with OTP verification
- Checks if the new email is already in use
- Generates and stores OTP for email verification
- Sends OTP to the new email address
- Stores pending email change request temporarily

**API Details**
- **Endpoint**: `POST /api/auth/start-email-change`
- **Access Control**: Authenticated users only
- **Request Body**: `{ newEmail }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for duplicate email checking
- **Utilities**: `otpStore.js` for temporary storage, `emailService.js` for sending emails
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- OTP generation uses Math.random() which is cryptographically weak

---

### verifyEmailChange

**Function Overview**
- Verifies the OTP for email change
- Updates the user's email address in the database
- Cleans up temporary OTP data
- Returns updated profile information

**API Details**
- **Endpoint**: `POST /api/auth/verify-email-change`
- **Access Control**: Authenticated users only
- **Request Body**: `{ newEmail, otp }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for email updates
- **Utilities**: `otpStore.js` for OTP verification
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- OTP verification logic is standard

---

### updateDob

**Function Overview**
- Updates the authenticated user's date of birth
- Validates the date format
- Returns updated profile information
- Uses MongoDB's `runValidators` for schema validation

**API Details**
- **Endpoint**: `PUT /api/auth/update-dob`
- **Access Control**: Authenticated users only
- **Request Body**: `{ dob }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` model for profile updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Date validation is basic (only checks if parseable)

---

### deleteAccount

**Function Overview**
- Permanently deletes the user account and all associated data
- Removes journal entries, chat sessions, and memory snapshots
- Deletes user vectors from Pinecone vector database
- Handles Pinecone deletion errors gracefully
- Returns success confirmation

**API Details**
- **Endpoint**: `DELETE /api/auth/delete-account`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User`, `JournalEntry`, `ChatSession`, `MemorySnapshot` for data deletion
- **Utilities**: `pinecone.js` for vector database cleanup
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Pinecone deletion errors are logged but don't block account deletion
- Comprehensive data cleanup ensures no orphaned data remains 