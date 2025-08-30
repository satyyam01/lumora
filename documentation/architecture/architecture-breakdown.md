# Lumora Architecture Breakdown

## Overview
Lumora is a full-stack journaling platform with AI-powered insights, semantic search, and intelligent goal tracking. Built with modern web technologies and AI services for personalized user experiences.

---

## Feature 1: AI-Powered Journal Analysis & RAG Pipeline

### Feature Summary
Automatically analyzes journal entries using AI to extract emotional insights, generates vector embeddings for semantic search, and enables context-aware AI conversations based on user's journaling history.

### Tech Stack & Tools
- **Backend**: Node.js, Express, AI service adapters
- **AI Services**: Cohere (embeddings), Groq LLM (analysis), Pinecone (vector database)
- **Database**: MongoDB for journal storage, Pinecone for vector search
- **Frontend**: React hooks for real-time updates

### Architecture Flow
1. **User Input**: User creates/updates journal entry via React form
2. **Backend Processing**: `journalController.createEntry()` saves entry to MongoDB
3. **AI Analysis**: `summarize.js` calls Groq LLM to extract mood, sentiment, tags, and bullet points
4. **Vector Generation**: `cohere.js` converts bullet points to 1024-dimensional embeddings
5. **Vector Storage**: `pinecone.js` upserts embeddings with metadata to Pinecone
6. **Real-time Response**: Frontend receives enriched entry data with AI insights
7. **Semantic Search**: Chat queries use embeddings to find relevant journal context
8. **RAG Response**: LLM generates responses grounded in retrieved journal entries

### Design Decisions & Trade-offs
- **Chose Cohere over OpenAI**: Better pricing for embedding generation, 1024D vectors provide good search quality
- **Pinecone over pgvector**: Managed service reduces ops burden, fast similarity search
- **Synchronous AI processing**: Ensures data consistency but increases response time
- **Vector metadata**: Stores rich context for better search relevance

### Potential Improvements
- **Asynchronous processing**: Queue AI tasks to improve user experience
- **Embedding caching**: Cache repeated text embeddings to reduce API costs
- **Hybrid search**: Combine vector similarity with keyword search for better results
- **User isolation**: Implement per-user Pinecone namespaces for security

---

## Feature 2: Timezone-Aware Streak System

### Feature Summary
Tracks user journaling streaks with precise timezone handling, ensuring accurate consecutive day calculations regardless of server location or user timezone.

### Tech Stack & Tools
- **Backend**: Node.js, moment-timezone, MongoDB aggregation
- **Database**: MongoDB with date indexing
- **Frontend**: React hooks, date-fns-tz for display
- **Timezone**: IST (Indian Standard Time) standardization

### Architecture Flow
1. **Entry Creation**: User submits journal entry with selected date
2. **Date Conversion**: Frontend converts IST date to UTC midnight equivalent
3. **Database Storage**: Entry saved with `createdForDate` and `createdAt` timestamps
4. **Streak Calculation**: `updateUserStreak()` function processes consecutive day logic
5. **User Update**: MongoDB updates user's streak data atomically
6. **Real-time Display**: Frontend shows current streak, longest streak, weekly progress
7. **Automatic Reset**: System detects streak breaks and resets accordingly

### Design Decisions & Trade-offs
- **IST Standardization**: Chose single timezone for consistency over user-local time
- **Dual Timestamps**: `createdAt` for system use, `createdForDate` for user intent
- **Moment.js**: Robust timezone handling over native Date API
- **Atomic Updates**: Ensures streak consistency during concurrent operations

### Potential Improvements
- **Redis caching**: Cache streak calculations to reduce database queries
- **Batch processing**: Process multiple users' streaks in single operation
- **Timezone flexibility**: Allow users to set preferred timezone
- **Streak analytics**: Add historical streak patterns and insights

---

## Feature 3: Intelligent Reminder System

### Feature Summary
Automated email reminder service that intelligently determines when users need journaling reminders based on their goals, progress, and preferences using cron-based scheduling.

### Tech Stack & Tools
- **Backend**: Node.js, node-cron, MongoDB queries
- **Email**: Nodemailer, SMTP/Gmail fallback, HTML templates
- **Database**: MongoDB for user goals and reminder preferences
- **Scheduling**: Cron jobs with IST timezone handling

### Architecture Flow
1. **Cron Trigger**: `node-cron` runs every 5 minutes in IST timezone
2. **User Selection**: `goalController.checkReminders()` queries users needing reminders
3. **Eligibility Check**: Filters active goals, enabled reminders, no today entry, no duplicate
4. **Email Generation**: `emailService.js` creates personalized HTML with progress bars
5. **Delivery**: Nodemailer sends emails with retry logic and exponential backoff
6. **Status Update**: `markReminderSent()` prevents duplicate reminders
7. **Logging**: Comprehensive logging for monitoring and debugging

### Design Decisions & Trade-offs
- **Node-cron over BullMQ**: Simple in-process scheduling for initial implementation
- **SMTP + Gmail fallback**: Flexibility over managed email services
- **30-minute reminder windows**: Balances user preference with system efficiency
- **Individual user processing**: Ensures one user's failure doesn't affect others

### Potential Improvements
- **Distributed scheduling**: Move to Redis-based job queue for reliability
- **Email analytics**: Track delivery rates, opens, and user engagement
- **Smart timing**: ML-based optimization of reminder timing
- **Multi-channel**: Add SMS and push notifications

---

## Feature 4: Multi-Provider Email Infrastructure

### Feature Summary
Dynamic email delivery system supporting multiple SMTP providers with automatic fallback, intelligent retry mechanisms, and responsive HTML templates.

### Tech Stack & Tools
- **Backend**: Node.js, Nodemailer, dynamic transporter creation
- **Email Providers**: Custom SMTP (Zoho), Gmail fallback
- **Templates**: Custom HTML with embedded CSS, responsive design
- **Retry Logic**: Exponential backoff with configurable attempts

### Architecture Flow
1. **Provider Detection**: `createTransporter()` checks environment variables
2. **Transporter Creation**: Builds Nodemailer transporter with appropriate config
3. **Email Sending**: `sendEmail()` with retry logic and exponential backoff
4. **Fallback Handling**: Automatic switch to Gmail if primary SMTP fails
5. **Template Rendering**: HTML templates with dynamic content and branding
6. **Delivery Tracking**: Success/failure logging and status reporting

### Design Decisions & Trade-offs
- **Nodemailer over SendGrid**: Direct SMTP control over managed service costs
- **Dynamic transporters**: Fresh connections for each attempt to avoid stale connections
- **Embedded CSS**: Email client compatibility over external stylesheets
- **Exponential backoff**: Intelligent retry timing to avoid overwhelming providers

### Potential Improvements
- **Email service migration**: Move to SES/SendGrid for scale and analytics
- **Template system**: Adopt MJML for better email development workflow
- **Delivery monitoring**: Add bounce handling and email analytics
- **Rate limiting**: Implement per-provider rate limiting

---

## Feature 5: Cascading Account Deletion

### Feature Summary
Comprehensive data cleanup system that removes user data across multiple databases and services while maintaining data consistency and privacy compliance.

### Tech Stack & Tools
- **Backend**: Node.js, MongoDB aggregation, Pinecone API
- **Database**: MongoDB collections, Pinecone vector database
- **Security**: JWT authentication, user ownership verification
- **Error Handling**: Graceful degradation and comprehensive logging

### Architecture Flow
1. **Authentication**: JWT middleware verifies user ownership
2. **Data Identification**: Maps all user-related data across collections
3. **Cascade Deletion**: Removes journal entries, chat sessions, memory snapshots
4. **Vector Cleanup**: Deletes Pinecone embeddings using metadata filtering
5. **User Removal**: Final deletion of user account and profile
6. **Status Verification**: Confirms complete data removal
7. **Audit Logging**: Records deletion operations for compliance

### Design Decisions & Trade-offs
- **Atomic operations**: Ensures complete deletion or rollback
- **Error isolation**: Individual service failures don't block overall deletion
- **Metadata filtering**: Uses Pinecone metadata for user-specific vector removal
- **Comprehensive cleanup**: Removes all traces of user data

### Potential Improvements
- **Soft deletion**: Implement reversible deletion with cleanup scheduling
- **Data archiving**: Archive data before deletion for compliance
- **Batch operations**: Optimize deletion for users with large data volumes
- **Audit trails**: Enhanced logging and compliance reporting

---

## Feature 6: Context-Aware AI Chat

### Feature Summary
AI-powered chat system that provides personalized journaling assistance by retrieving relevant past entries and generating context-aware responses.

### Tech Stack & Tools
- **Backend**: Node.js, AI service integration, session management
- **AI Services**: Cohere embeddings, Groq LLM, Pinecone vector search
- **Database**: MongoDB for chat sessions, Pinecone for entry retrieval
- **Frontend**: React chat interface with real-time updates

### Architecture Flow
1. **User Message**: User submits chat message via React interface
2. **Message Embedding**: `cohere.js` converts message to vector representation
3. **Semantic Search**: `pinecone.js` queries for top-K similar journal entries
4. **Context Assembly**: Formats retrieved entries into LLM prompt
5. **AI Generation**: `groq.js` generates response using context and conversation history
6. **Session Storage**: Saves chat session with messages and metadata
7. **Response Delivery**: Frontend displays AI response with context

### Design Decisions & Trade-offs
- **Vector search over keyword**: Better semantic understanding of user intent
- **Top-K retrieval**: Balances context relevance with response generation cost
- **Session persistence**: Maintains conversation history for continuity
- **Context window**: Limits context to prevent token overflow

### Potential Improvements
- **User filtering**: Implement per-user Pinecone filtering for privacy
- **Conversation memory**: Add long-term memory for better context
- **Response caching**: Cache common queries to reduce AI costs
- **Multi-modal**: Support image and voice input for journal entries

---

## Overall System Architecture

### Data Flow
- **Frontend**: React SPA with Vite dev server (port 5173)
- **Backend**: Express API server (port 3000) with CORS configuration
- **Database**: MongoDB Atlas with Mongoose ODM
- **AI Pipeline**: Cohere → Pinecone → Groq for RAG functionality
- **Background Services**: Cron-based reminder system with email delivery

### Security Features
- **JWT Authentication**: Stateless token-based auth for API endpoints
- **Password Hashing**: Bcrypt with salt rounds for secure storage
- **User Isolation**: Database queries filtered by authenticated user ID
- **Input Validation**: Server-side validation for all user inputs

### Scalability Considerations
- **Stateless API**: Enables horizontal scaling of backend services
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Caching Strategy**: Vector embeddings cached to reduce AI API calls
- **Background Processing**: Cron jobs handle time-intensive operations

### Monitoring & Observability
- **Structured Logging**: Comprehensive logging across all system components
- **Error Handling**: Graceful degradation with detailed error reporting
- **Performance Metrics**: Response time tracking for AI service calls
- **User Analytics**: Goal completion rates and engagement metrics 