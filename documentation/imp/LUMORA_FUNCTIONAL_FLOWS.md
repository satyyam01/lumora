# Lumora Application - Comprehensive Functional Flows Documentation

## Overview
This document provides a complete analysis of all major functional flows within the Lumora journaling application. Lumora is a MERN stack application that combines traditional journaling with AI-powered insights, goal tracking, and intelligent reminders.

## Overview
This document provides a complete analysis of all major functional flows within the Lumora journaling application. Lumora is a MERN stack application that combines traditional journaling with AI-powered insights, goal tracking, and intelligent reminders.

The application uses **LangGraph-based workflows** for all AI processing, providing structured, stateful AI workflows with enhanced error handling and validation.

## Table of Contents
1. [User Authentication & Management Flows](#user-authentication--management-flows)
2. [Journal Management Flows](#journal-management-flows)
3. [AI-Powered Chat & Insights Flows](#ai-powered-chat--insights-flows)
4. [Goal Setting & Tracking Flows](#goal-setting--tracking-flows)
5. [Background & System Flows](#background--system-flows)
6. [Data Processing & AI Pipeline Flows](#data-processing--ai-pipeline-flows)
7. [Email & Notification Flows](#email--notification-flows)
8. [Frontend State Management Flows](#frontend-state-management-flows)

---

## User Authentication & Management Flows

### 1. User Registration Flow
**Purpose**: Allow new users to create accounts with email verification
**Trigger**: User navigates to registration page and submits form
**Endpoints**: 
- `POST /api/request-otp` - Request OTP for registration
- `POST /api/verify-otp` - Verify OTP and complete registration
- `POST /api/register` - Traditional registration (fallback)

**Key Files & Functions**:
- `server/controllers/authController.js` - `requestOtp()`, `verifyOtp()`, `register()`
- `server/utils/otpStore.js` - OTP storage and management
- `server/utils/emailService.js` - Email delivery
- `server/models/User.js` - User data model

**Data Flow**:
1. User submits registration form → Frontend validation
2. Frontend → `POST /api/request-otp` → Backend generates 6-digit OTP
3. Backend stores pending user data in memory + sends OTP email
4. User receives email → Enters OTP → Frontend → `POST /api/verify-otp`
5. Backend verifies OTP → Creates user in MongoDB → Returns JWT token
6. Frontend stores token → Redirects to dashboard

### 2. User Login Flow
**Purpose**: Authenticate existing users and provide access to application
**Trigger**: User submits login credentials
**Endpoints**: `POST /api/login`

**Key Files & Functions**:
- `server/controllers/authController.js` - `login()`
- `server/utils/jwt.js` - JWT token generation
- `server/middleware/auth.js` - Authentication middleware

**Data Flow**:
1. User submits email/password → Frontend validation
2. Frontend → `POST /api/login` → Backend validates credentials
3. Backend compares password hash → Generates JWT token
4. Frontend stores token → Redirects to dashboard

### 3. Profile Management Flow
**Purpose**: Allow users to view and update their profile information
**Trigger**: User accesses profile page or updates information
**Endpoints**:
- `GET /api/profile` - Retrieve user profile
- `PATCH /api/profile/name` - Update user name
- `PATCH /api/profile/dob` - Update date of birth
- `POST /api/profile/email/request-otp` - Request email change OTP
- `POST /api/profile/email/verify-otp` - Verify email change OTP

**Key Files & Functions**:
- `server/controllers/authController.js` - Profile management functions
- `server/middleware/auth.js` - Authentication verification

**Data Flow**:
1. Frontend requests profile data → `GET /api/profile`
2. Backend verifies JWT → Returns user profile data
3. User updates information → Frontend → PATCH endpoints
4. Backend validates and updates MongoDB → Returns updated profile

### 4. Account Deletion Flow
**Purpose**: Permanently remove user account and all associated data
**Trigger**: User requests account deletion
**Endpoints**: `DELETE /api/profile`

**Key Files & Functions**:
- `server/controllers/authController.js` - `deleteAccount()`
- `server/langgraph/summarizeGraph.js` - Vector cleanup via LangGraph
- Various models for cascading deletion

**Data Flow**:
1. User confirms deletion → Frontend → `DELETE /api/profile`
2. Backend verifies JWT → Cascading deletion:
   - Journal entries
   - Chat sessions
   - Memory snapshots
   - Pinecone vectors
   - User account
3. Returns success confirmation

---

## Journal Management Flows

### 5. Journal Entry Creation Flow
**Purpose**: Create new journal entries with AI-powered summarization
**Trigger**: User creates new journal entry
**Endpoints**: `POST /api/journals`

**Key Files & Functions**:
- `server/langgraph/summarizeGraph.js` - LangGraph summarization workflow
- `server/controllers/journalController.js` - `createEntry()`
- `server/models/JournalEntry.js` - Entry data model

**Data Flow**:
1. User writes entry → Frontend → `POST /api/journals`
2. Backend saves entry to MongoDB → Updates user streak data
3. AI pipeline processes entry via LangGraph:
   - Routes to `summarizeGraph.invoke()` with entry data
   - Executes structured workflow: `summarize` → `embedBullets` → `upsertPinecone` → `persistSummary`
   - Automatic LLM analysis with Zod validation
   - Structured embedding generation and vector storage
4. Returns created entry with AI insights

### 6. Journal Entry Retrieval Flow
**Purpose**: Fetch journal entries for display and analysis
**Trigger**: User views journal list or specific entry
**Endpoints**:
- `GET /api/journals` - All entries
- `GET /api/journals/today` - Today's entries
- `GET /api/journals/:id` - Specific entry

**Key Files & Functions**:
- `server/controllers/journalController.js` - Retrieval functions
- `server/models/JournalEntry.js` - Database queries

**Data Flow**:
1. Frontend requests entries → GET endpoints
2. Backend verifies JWT → Queries MongoDB
3. Returns filtered/processed entry data
4. Frontend renders entries with formatting

### 7. Journal Entry Update Flow
**Purpose**: Modify existing journal entries
**Trigger**: User edits journal entry
**Endpoints**: `PUT /api/journals/:id`

**Key Files & Functions**:
- `server/langgraph/summarizeGraph.js` - LangGraph summarization workflow
- `server/controllers/journalController.js` - `updateEntry()`
- `server/models/JournalEntry.js` - Entry data model

**Data Flow**:
1. User edits entry → Frontend → `PUT /api/journals/:id`
2. Backend updates MongoDB → Re-processes with AI pipeline
3. AI pipeline reprocesses entry via LangGraph:
   - Routes to `summarizeGraph.invoke()` with updated entry data
   - Executes structured workflow for reprocessing
   - Automatic vector updates and metadata refresh
4. Returns updated entry with refreshed AI insights

### 8. Journal Entry Deletion Flow
**Purpose**: Remove journal entries permanently
**Trigger**: User deletes journal entry
**Endpoints**: `DELETE /api/journals/:id`

**Key Files & Functions**:
- `server/controllers/journalController.js` - `deleteEntry()`
- `server/langgraph/summarizeGraph.js` - Vector cleanup via LangGraph

**Data Flow**:
1. User confirms deletion → Frontend → `DELETE /api/journals/:id`
2. Backend removes from MongoDB → Cleans up Pinecone vectors
3. Updates user streak data if needed

### 9. Journal Analytics Flow
**Purpose**: Provide insights and statistics about journaling patterns
**Trigger**: User views dashboard or analytics
**Endpoints**:
- `GET /api/journals/stats/today-mood` - Today's mood
- `GET /api/journals/stats/weekly-sentiment` - Weekly trends
- `GET /api/journals/stats/streak` - Streak data

**Key Files & Functions**:
- `server/controllers/journalController.js` - Analytics functions
- `server/models/User.js` - Streak tracking

**Data Flow**:
1. Frontend requests analytics → GET endpoints
2. Backend calculates statistics from MongoDB data
3. Returns processed analytics data
4. Frontend renders charts and insights

---

## AI-Powered Chat & Insights Flows

### 10. Chat Session Management Flow
**Purpose**: Manage conversational AI interactions with journal context
**Trigger**: User starts or continues chat conversation
**Endpoints**:
- `POST /api/chat/session` - Start new session
- `POST /api/chat/session/:id` - Continue session
- `GET /api/chat/sessions` - List sessions
- `GET /api/chat/session/:id` - Get session
- `DELETE /api/chat/session/:id` - Delete session

**Key Files & Functions**:
- `server/langgraph/chatGraph.js` - LangGraph chat workflow
- `server/controllers/chatController.js` - Session management
- `server/models/ChatSession.js` - Session storage

**Data Flow**:
1. User starts chat → Frontend → `POST /api/chat/session`
2. AI pipeline processes via LangGraph:
   - Routes to `chatGraph.invoke()` with user context
   - Executes structured workflow: `loadContext` → `embedQuery` → `retrieveDocs` → `assembleContext` → `generate`
   - Automatic context assembly and response generation
   - Creates chat session in MongoDB
3. Returns AI response and session data

### 11. AI Chat with Journal Context Flow
**Purpose**: Provide intelligent responses based on user's journal history
**Trigger**: User asks question in chat
**Endpoints**: `POST /api/chat/chat`

**Key Files & Functions**:
- `server/langgraph/chatGraph.js` - LangGraph chat workflow
- `server/controllers/chatController.js` - `chatWithJournal()`

**Data Flow**:
1. User submits question → Frontend → `POST /api/chat/chat`
2. AI pipeline processes via LangGraph:
   - Routes to `chatGraph.invoke()` with user context
   - Executes structured workflow: `loadContext` → `embedQuery` → `retrieveDocs` → `assembleContext` → `generate`
   - Automatic context assembly and response generation
3. Returns AI response with relevant context

### 12. LangGraph Chat Flow
**Purpose**: Advanced AI conversation using LangGraph framework
**Trigger**: User uses LangGraph-enabled chat
**Endpoints**: `POST /api/chat/test/chat`

**Key Files & Functions**:
- `server/langgraph/chatGraph.js` - Graph definition and execution
- `server/controllers/chatController.js` - LangGraph integration

**Data Flow**:
1. User submits query → Frontend → LangGraph endpoint
2. LangGraph executes workflow:
   - Load context (entry-specific or global)
   - Embed query for semantic search
   - Retrieve relevant documents
   - Assemble context
   - Generate AI response
3. Returns structured response with metadata

---

## Goal Setting & Tracking Flows

### 13. Goal Creation Flow
**Purpose**: Set journaling goals with target days and reminders
**Trigger**: User sets new journaling goal
**Endpoints**: `POST /api/goals/set`

**Key Files & Functions**:
- `server/controllers/goalController.js` - `setGoal()`
- `server/models/User.js` - Goal data storage

**Data Flow**:
1. User sets goal parameters → Frontend → `POST /api/goals/set`
2. Backend validates parameters → Calculates start/end dates
3. Updates user document with goal data
4. Returns goal confirmation

### 14. Goal Progress Tracking Flow
**Purpose**: Monitor progress toward journaling goals
**Trigger**: User views goal progress or system checks progress
**Endpoints**: `GET /api/goals/current`

**Key Files & Functions**:
- `server/controllers/goalController.js` - `getGoal()`
- `server/models/JournalEntry.js` - Progress calculation

**Data Flow**:
1. Frontend requests goal status → `GET /api/goals/current`
2. Backend calculates progress:
   - Counts entries within goal period
   - Determines completion status
   - Updates goal state if needed
3. Returns progress data with completion status

### 15. Goal Reminder Management Flow
**Purpose**: Manage reminder settings and scheduling
**Trigger**: User updates reminder preferences
**Endpoints**: `PUT /api/goals/reminder-settings`

**Key Files & Functions**:
- `server/controllers/goalController.js` - `updateReminderSettings()`
- `server/models/User.js` - Reminder configuration

**Data Flow**:
1. User updates settings → Frontend → `PUT /api/goals/reminder-settings`
2. Backend validates and updates user preferences
3. Returns updated reminder configuration

---

## Background & System Flows

### 16. Automated Reminder System Flow
**Purpose**: Send daily reminders to users with active goals
**Trigger**: Scheduled cron job (every 5 minutes)
**Endpoints**: Internal system process

**Key Files & Functions**:
- `server/app.js` - Cron job scheduling
- `server/services/reminderService.js` - Reminder logic
- `server/controllers/goalController.js` - Reminder checking

**Data Flow**:
1. Cron job triggers every 5 minutes (IST timezone)
2. System checks for users needing reminders:
   - Active goals with reminders enabled
   - No entry made today
   - Reminder time window reached
3. Sends email notifications via email service
4. Updates reminder sent timestamps

### 17. OTP Cleanup Flow
**Purpose**: Automatically clean expired OTP codes
**Trigger**: Scheduled interval (set in app.js)
**Endpoints**: Internal system process

**Key Files & Functions**:
- `server/utils/otpStore.js` - OTP management and cleanup
- `server/app.js` - Cleanup interval initialization

**Data Flow**:
1. System starts cleanup interval on startup
2. Periodically removes expired OTP codes from memory
3. Maintains system performance and security

### 18. Database Connection Management Flow
**Purpose**: Manage MongoDB connections and handle failures
**Trigger**: Application startup and connection events
**Endpoints**: Internal system process

**Key Files & Functions**:
- `server/app.js` - Database connection setup
- `server/services/reminderService.js` - Service-specific connections

**Data Flow**:
1. Application startup → Attempts MongoDB connection
2. Connection success → Starts server and services
3. Connection failure → Logs error and exits process
4. Service connections managed independently

---

## Data Processing & AI Pipeline Flows

### 19. Journal Entry Summarization Flow
**Purpose**: Generate AI-powered insights from journal entries using structured workflows
**Trigger**: New entry creation or entry updates
**Endpoints**: Internal AI processing

**Key Files & Functions**:
- `server/langgraph/summarizeGraph.js` - LangGraph summarization workflow

**Data Flow**:
1. Journal entry created/updated → Triggers summarization
2. AI pipeline processes via LangGraph:
   - `summarizeGraph.invoke()` executes structured workflow
   - LLM analyzes content with Zod validation
   - Automatic bullet point embedding generation
   - Pinecone vector storage via LangGraph nodes
3. Results stored with journal entry

### 20. Vector Embedding & Storage Flow
**Purpose**: Create and store semantic representations of journal content
**Trigger**: Journal entry processing
**Endpoints**: Internal AI processing

**Key Files & Functions**:
- `server/langgraph/summarizeGraph.js` - LangGraph embedding workflow

**Data Flow**:
1. Journal entry processed → Text sent for embedding
2. AI pipeline processes via LangGraph:
   - `embedBullets` node generates embeddings via LangChain Cohere wrapper
   - `upsertPinecone` node stores vectors with metadata
   - Structured workflow with error handling
3. Enables semantic search and retrieval

### 21. Semantic Search Flow
**Purpose**: Find relevant journal entries based on user queries
**Trigger**: Chat queries or AI context retrieval
**Endpoints**: Internal AI processing

**Key Files & Functions**:
- `server/langgraph/chatGraph.js` - LangGraph search workflow
- `server/controllers/chatController.js` - Search orchestration

**Data Flow**:
1. User query received → Converted to embedding
2. AI pipeline processes via LangGraph:
   - `embedQuery` node generates embeddings via LangChain
   - `retrieveDocs` node searches Pinecone via custom HTTP functions
   - `assembleContext` node formats results intelligently
3. Context assembled for AI response generation

---

## Email & Notification Flows

### 22. OTP Email Delivery Flow
**Purpose**: Send verification codes for registration and email changes
**Trigger**: User requests OTP
**Endpoints**: Internal email service

**Key Files & Functions**:
- `server/utils/emailService.js` - `sendEmail()`
- `server/utils/emailTemplates/otp.js` - OTP email templates
- `server/controllers/authController.js` - OTP generation

**Data Flow**:
1. OTP requested → System generates 6-digit code
2. Email template populated with OTP
3. Email service sends via configured SMTP
4. User receives verification email

### 23. Goal Reminder Email Flow
**Purpose**: Send daily reminders to users with active goals
**Trigger**: Reminder service determines user needs reminder
**Endpoints**: Internal email service

**Key Files & Functions**:
- `server/utils/emailService.js` - `sendEmail()`
- `server/utils/emailTemplates/notification.js` - Reminder templates
- `server/services/reminderService.js` - Reminder logic

**Data Flow**:
1. Reminder service identifies users needing reminders
2. Email template populated with goal progress data
3. Email service sends personalized reminder
4. System marks reminder as sent

### 24. Email Configuration Management Flow
**Purpose**: Manage email service configuration and fallbacks
**Trigger**: Email service initialization
**Endpoints**: Internal system process

**Key Files & Functions**:
- `server/utils/emailService.js` - `createTransporter()`
- Environment variable configuration

**Data Flow**:
1. System checks email configuration
2. Primary SMTP configuration used if available
3. Fallback to Gmail if primary not configured
4. Transporter created with appropriate settings

---

## Frontend State Management Flows

### 25. Authentication State Flow
**Purpose**: Manage user authentication status across the application
**Trigger**: Login, logout, or page refresh
**Endpoints**: Frontend state management

**Key Files & Functions**:
- `client/src/components/ProtectedRoute.jsx` - Route protection
- `client/src/components/AuthForm.jsx` - Authentication forms
- JWT token storage and validation

**Data Flow**:
1. User logs in → JWT token stored in localStorage
2. Protected routes check token validity
3. Token expiration → Redirect to login
4. Logout → Token removed, state cleared

### 26. Journal Data Fetching Flow
**Purpose**: Retrieve and manage journal entries in frontend
**Trigger**: Component mounting or data refresh
**Endpoints**: Frontend hooks and API calls

**Key Files & Functions**:
- `client/src/hooks/useTodaysEntries.js` - Today's entries hook
- `client/src/hooks/useTodaysEntriesWithRefetch.js` - Refetchable entries
- `client/src/components/JournalList.jsx` - Entry display

**Data Flow**:
1. Component mounts → Hook fetches data from API
2. Data stored in React state
3. UI renders with fetched data
4. Manual refresh triggers data refetch

### 27. Real-time Updates Flow
**Purpose**: Keep frontend data synchronized with backend changes
**Trigger**: Data modifications or periodic updates
**Endpoints**: Frontend state synchronization

**Key Files & Functions**:
- React hooks with refetch capabilities
- State management patterns
- API polling where appropriate

**Data Flow**:
1. Backend data changes → Frontend detects need for update
2. API calls made to fetch latest data
3. State updated with new information
4. UI re-renders with updated data

### 28. Form Validation & Submission Flow
**Purpose**: Validate user input and submit data to backend
**Trigger**: User form submission
**Endpoints**: Frontend validation + backend submission

**Key Files & Functions**:
- Form components with validation logic
- API integration for data submission
- Error handling and user feedback

**Data Flow**:
1. User fills form → Frontend validation
2. Validation passes → Data submitted to backend
3. Backend processes request → Returns response
4. Frontend handles success/error states



## Summary

The Lumora application implements a comprehensive set of functional flows that work together to provide:

- **User Management**: Secure authentication, profile management, and account lifecycle
- **Journal Management**: CRUD operations with AI-powered insights and analytics
- **AI Integration**: LangGraph-based workflows for summarization, chat, and semantic search
- **Goal Tracking**: Intelligent goal setting with automated reminders
- **Background Processing**: Scheduled tasks for maintenance and notifications
- **Data Pipeline**: Vector storage, semantic search, and AI processing workflows via LangGraph
- **Frontend Management**: Responsive UI with real-time data synchronization

Each flow is designed with proper error handling, authentication, and data validation to ensure a robust user experience. The system architecture uses **LangGraph-based AI workflows** for all AI processing, providing structured, stateful workflows with enhanced error handling and validation, making it a comprehensive and modern journaling platform. 