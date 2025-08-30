# Lumora: System Architecture and Feature Documentation

## 1. High‑Level Overview

- **Purpose**
  - Lumora is a wellness journaling and AI‑assisted reflection app. It helps users build a consistent journaling habit, understand emotional patterns through auto‑generated insights, and chat with an empathetic AI that references past context.
  - It solves consistency and insight gaps by:
    - Streamlining journal capture and retrieval
    - Computing mood/sentiment and weekly trends
    - Providing multi‑turn AI conversations grounded in past entries
    - Sending gentle, scheduled reminder emails

- **Tech Stack**
  - **Backend**: Node.js, Express, Mongoose, JWT, bcrypt, node‑cron, CORS, dotenv
  - **Frontend**: React (Vite), React Router, custom components and hooks
  - **Database**: MongoDB (via Mongoose)
  - **AI/ML**: Cohere (embeddings), Pinecone (vector DB), Groq LLM (chat/summarization)
  - **Email/Notifications**: Nodemailer (supports SMTP or Gmail)

- **High‑Level Architecture (described)**
  - React SPA runs in the browser and calls `/api/...` endpoints (Vite proxies to `http://localhost:3000`).
  - Express app mounts feature routes for registration/auth, journals, chat, and goals. Requests pass through JWT auth middleware where required.
  - Controllers execute business logic and call services/utils (AI adapters, email, OTP store) and Mongoose models.
  - MongoDB persists users, journal entries, chat sessions, and memory snapshots.
  - node‑cron triggers a reminder service that selects users needing nudges and sends emails.

- **Design Principles**
  - **Separation of concerns**: routes, controllers, middleware, services/utils, and models are modularized
  - **Single responsibility**: each module does one thing (auth, journaling logic, AI calls, email, etc.)
  - **Loose coupling**: controllers rely on abstractions in `ai/` and `utils/`, making providers swappable
  - **Abstraction**: LLM, embeddings, and email transports are behind thin adapters
  - **Security by default**: JWT auth on protected endpoints, password hashing, input checks


## 2. Detailed Architecture

### 2.1 Backend overview

- **Entrypoint**: `server/app.js`
  - Loads env, configures CORS for `http://localhost:5173`, JSON body parsing
  - Mounts routes:
    - `app.use('/api', registrationRoute)` → registration/auth/profile endpoints
    - `app.use('/api/journals', journalRoutes)` → journals CRUD + stats
    - `app.use('/api/chat', chatRoutes)` → chat sessions and stateless chat
    - `app.use('/api/goals', goalRoutes)` → goal + reminder settings
  - Starts OTP cleanup interval (`utils/otpStore.startCleanupInterval()`)
  - Starts a cron schedule (every 5 minutes, IST) invoking `services/reminderService.sendDailyReminders()`
  - Connects to MongoDB and starts HTTP server on port 3000

- **Routes → Middleware → Controllers → Models**
  - Example (journals):
    - `server/routes/journalRoutes.js` protects all endpoints with `middleware/auth.js`
    - Routes map to `controllers/journalController.js` methods
    - Controller uses models (`models/JournalEntry.js`, `models/User.js`) and AI adapters (`ai/*`) as needed

- **Key folders**
  - `server/controllers/`
    - `authController.js`: registration, login, OTP flows, profile updates, account deletion
    - `journalController.js`: CRUD entries, summarization, embeddings, stats, streak updates
    - `chatController.js`: start/continue sessions, list/get/delete sessions, stateless chat
    - `goalController.js`: set/cancel goals, reminder settings, compute progress, select users for reminders
  - `server/routes/`
    - `registrationRoute.js`: `/api/request-otp`, `/api/verify-otp`, `/api/register`, `/api/login`, profile endpoints
    - `journalRoutes.js`: CRUD + stats under `/api/journals` (all protected)
    - `chatRoutes.js`: chat endpoints under `/api/chat` (protected); includes stateless `/api/chat/chat`
    - `goalRoutes.js`: journaling goal and reminder settings (protected)
  - `server/middleware/`
    - `auth.js`: JWT Bearer verification → sets `req.user`
  - `server/models/`
    - `User.js`: email, password, name, streakData, goalData
    - `JournalEntry.js`: title, content, user, createdForDate, mood, summary, sentiment, intent, tags, embedding/metadata
    - `ChatSession.js`: user, optional entry ref, title, messages, closed, summary, insights
    - `MemorySnapshot.js`: semantic memory chunks tied to chat or journal
  - `server/ai/`
    - `cohere.js`: `embedTextWithCohere(text)`
    - `pinecone.js`: `upsertToPinecone`, `queryPinecone`, `deleteUserVectorsFromPinecone`
    - `llm.js`: `callLLM(prompt)` for summarization; `callChat(input)` for chat (string or messages[])
  - `server/services/`
    - `reminderService.js`: cron‑driven email reminder orchestration
  - `server/utils/`
    - `jwt.js`: `signToken`, `verifyToken`
    - `emailService.js`: `sendEmail` with SMTP/Gmail fallback; templates for OTP/goal reminder
    - `otpStore.js`: in‑memory store for pending users and OTPs with cleanup interval

- **External integrations**
  - MongoDB via Mongoose
  - Cohere embeddings → Pinecone vectors for semantic search over journal summaries/bullets
  - Groq LLM for summarization and chat
  - Nodemailer for email via SMTP or Gmail

### 2.2 Frontend overview

- **Entrypoint & Router**
  - `client/src/main.jsx` boots React; `client/src/App.jsx` declares routes
  - Vite dev proxy forwards `/api` to `http://localhost:3000`

- **Routes in `App.jsx`**
  - Public: `/` (homepage), `/register`, `/login`, `/features`
  - Protected (wrapped by `components/ProtectedRoute.jsx`): `/dashboard`, `/journals`, `/journals/:id`, `/chat`, `/weekly-trend`, `/profile`

- **Auth**
  - `ProtectedRoute.jsx` reads JWT token from `localStorage` and redirects to `/login` when absent

- **Data fetching hooks**
  - `hooks/useTodaysEntries.js` → GET `/api/journals/today`
  - `hooks/useTodayMood.js` → GET `/api/journals/stats/today-mood`
  - `hooks/useWeeklySentimentTrend.js` → GET `/api/journals/stats/weekly-sentiment`

- **Chat API wrapper**: `client/src/api/chat.js`
  - `fetchChatSessions`, `createChatSession`, `fetchSessionMessages`, `sendMessageToSession`, `deleteChatSession`

- **Key UI components**
  - `Home.jsx`, `JournalList.jsx`, `EntryEditor.jsx`
  - `ChatPage.jsx` (multi‑pane chat, sessions sidebar, main chat area)
  - `ProfilePage.jsx`, `Layout.jsx`, `AuthForm.jsx`, `Register.jsx`, `Login.jsx`


## 3. Major Features and Flows

Below, each feature lists:
- User story
- Request/response flow
- Auth & authorization
- Involved controllers/services/models
- Data flow (Frontend → Backend → DB → Frontend)

### 3.1 OTP Registration & Login

- **User story**: As a new user, I want to sign up with OTP verification so my account is verified; as a returning user, I want to log in and get a token.

- **Flow (OTP Registration)**
  1. Frontend `Register.jsx` → POST `/api/request-otp` with `{ email, password, name, dob }`
  2. `authController.requestOtp` validates inputs, checks uniqueness, generates 6‑digit OTP, stores pending user in `otpStore`, and emails the OTP via `emailService`
  3. User submits OTP → POST `/api/verify-otp` with `{ email, otp }`
  4. `authController.verifyOtp` validates, creates user in MongoDB (bcrypt hashed password), returns JWT via `utils/jwt.signToken`
  5. Frontend stores `token` in `localStorage`, navigates to `/dashboard`

- **Flow (Login)**
  1. Frontend `Login.jsx` → POST `/api/login` with `{ email, password }`
  2. `authController.login` matches user, compares password with bcrypt, returns JWT
  3. Frontend stores `token` and routes to `/dashboard`

- **Auth**: Public endpoints for registration and login; everything else is JWT protected by `middleware/auth.js`

- **Modules**: `controllers/authController.js`, `utils/otpStore.js`, `utils/emailService.js`, `models/User.js`, `utils/jwt.js`

- **Data flow**: React form → Express → Controller → Mongo (user) → JWT → React stores token

### 3.2 Journal Entries: Create, View, Update, Delete, and Stats

- **User story**: As an authenticated user, I want to maintain daily journal entries, see today’s mood, and view weekly sentiment trends and streaks.

- **Create/Update flow**
  1. Frontend posts to `/api/journals` (create) or `/api/journals/:id` (update) with JWT
  2. `journalController.createEntry` creates entry and updates user streak; calls `summarizeJournalEntry` and embeds bullet text with `embedTextWithCohere`; upserts into Pinecone via `upsertToPinecone`
  3. `journalController.updateEntry` recomputes summary/embeddings and preserves original `createdAt` to avoid breaking streaks; upserts vector again

- **Read/Delete flow**
  - List: GET `/api/journals` (most recent first)
  - Today: GET `/api/journals/today`
  - By id: GET `/api/journals/:id`
  - Delete: DELETE `/api/journals/:id`

- **Stats**
  - Today’s mood: GET `/api/journals/stats/today-mood`
  - Weekly trend: GET `/api/journals/stats/weekly-sentiment`
  - Streak data: GET `/api/journals/stats/streak`

- **Auth**: All journal routes are protected; `router.use(auth)` guards the entire module

- **Modules**: `controllers/journalController.js`, `models/JournalEntry.js`, `models/User.js`, `ai/cohere.js`, `ai/pinecone.js`, `ai/llm.js`

- **Data flow**: React components/hooks → Express → Controller → Mongo (entries) + AI/Pinecone → React renders entries/stats

### 3.3 AI Chat: Session‑based multi‑turn and stateless chat

- **User story**: As an authenticated user, I want to chat with an AI that references my past journal context and saves chat history in sessions.

- **Start session**
  1. Frontend `ChatPage.jsx` calls POST `/api/chat/session` with `{ message, entryId? }`
  2. `chatController.startChatSession` optionally fetches the entry (for entry‑specific context) or builds context via embeddings + Pinecone query
  3. Builds a reflective prompt for the LLM and calls `callChat`
  4. Creates a `ChatSession` with `{ user, entry, title, messages }` and returns `sessionId`, messages, and AI answer

- **Continue session**
  1. Frontend POST `/api/chat/session/:id` with `{ message }`
  2. Controller loads recent messages, constructs a safe messages array, calls `callChat({ messages })`, appends user and AI messages, saves session, and returns updated messages

- **List/Get/Delete sessions**
  - GET `/api/chat/sessions` → paginated list with populated entry title
  - GET `/api/chat/session/:id` → one session with populated entry reference
  - DELETE `/api/chat/session/:id` → removes session

- **Stateless chat**
  - POST `/api/chat/chat` → single‑turn chat with Pinecone context, no session persistence

- **Auth**: All chat routes are protected by JWT middleware

- **Modules**: `controllers/chatController.js`, `models/ChatSession.js`, `ai/cohere.js`, `ai/pinecone.js`, `ai/llm.js`

- **Data flow**: React ChatPage/API → Express → Controller → LLM & Pinecone → Mongo (session) → React updates UI in real time

### 3.4 Goals and Email Reminders

- **User story**: As an authenticated user, I want to set a journaling goal with reminders so I stay consistent.

- **Goal management**
  - POST/PUT `/api/goals/...` (exact routes mapped in `goalRoutes.js`) to set target days, reminder time (HH:MM, 30‑min intervals), and enable/disable reminders
  - GET `/api/goals/...` to retrieve current goal and computed progress
  - Cancel goal endpoint to deactivate an active plan

- **Reminder selection (cron)**
  1. `app.js` schedules `reminderService.sendDailyReminders()` every 5 minutes (IST timezone)
  2. `goalController.checkReminders(now)` finds users with active goals who have not journaled today and are within 30 minutes of their preferred reminder time; skips if a reminder was already sent today
  3. For each user selected, `reminderService.sendEmailNotification(user)` generates templated HTML and sends email via `emailService.sendEmail`, then `goalController.markReminderSent(userId)` sets `lastReminderSent`

- **Auth**: Goal endpoints protected by JWT; reminder service runs server‑side without user interaction

- **Modules**: `services/reminderService.js`, `controllers/goalController.js`, `utils/emailService.js`, `models/User.js`, `models/JournalEntry.js`


## 4. Example Feature Walkthroughs (End‑to‑End)

### 4.1 OTP Registration
- Request: `Register.jsx` → `/api/request-otp`
- Middleware: none (public)
- Controller: `authController.requestOtp` → validate → `otpStore.setPendingUser` → `emailService.sendEmail`
- User submits OTP: `/api/verify-otp` → `authController.verifyOtp` → create `User` (bcrypt hash) → `jwt.signToken`
- Response: `{ token }` stored in `localStorage`
- Edge cases & errors:
  - Missing fields (400), duplicate email (409), invalid DOB (400)
  - OTP expired/not found (410), invalid OTP (401)
  - Email transport failures logged and surfaced as 500 with message

### 4.2 Journal Creation with AI Summary and Vector Upsert
- Request: `POST /api/journals` with `{ title, content, createdForDate? }` and `Authorization: Bearer <token>`
- Middleware: `auth` verifies token and sets `req.user`
- Controller: `journalController.createEntry`
  - Create entry, update streak via `updateUserStreak`
  - Summarize with `summarizeJournalEntry` (LLM)
  - Embed bullet points via Cohere → `embedTextWithCohere`
  - Upsert vector to Pinecone with metadata → `upsertToPinecone`
- Response: entry JSON
- Edge cases & errors:
  - Validation: missing title/content (400), ownership checks on read/update/delete
  - AI failures: logged but non‑blocking; user still gets saved entry (best effort enrichment)
  - Streak integrity: preserves `createdAt` during updates to avoid streak corruption

### 4.3 Continue Chat Session (Multi‑turn)
- Request: `POST /api/chat/session/:id` with `{ message }`, `Authorization: Bearer <token>`
- Middleware: `auth`
- Controller: `chatController.continueChatSession`
  - Load session by user + id; select recent messages
  - Build `messages` array for LLM, filter invalid entries
  - `callChat({ messages })` → returns assistant reply
  - Append both user and assistant messages → save session
- Response: `{ messages, answer }`
- Edge cases & errors:
  - Session not found (404), missing/invalid message (400)
  - LLM errors (500) with safe logging

### 4.4 Reminder Email Dispatch (Cron)
- Trigger: node‑cron every 5 minutes in IST → `reminderService.sendDailyReminders(now)`
- Service flow:
  - Ensure DB connection (service maintains its own connection state)
  - `goalController.checkReminders(now)` computes candidates based on goal activity, today’s entry status, reminder window, and lastReminderSent
  - For each candidate: generate email HTML (`utils/emailTemplates`), `emailService.sendEmail`, then `goalController.markReminderSent(userId)`
- Observability: structured logs with counts of successes/failures
- Edge cases & errors:
  - Email transport failures: retries with exponential backoff inside `sendEmail`
  - DB connection hiccups: error reported; service attempts connect on next run


## 5. Advanced Aspects

### 5.1 Security
- **Authentication**: JWT (Bearer) via `utils/jwt.js` with default expiry 1 day
- **Authorization**: Route‑level guard; journals/chat/goals use `middleware/auth.js`
- **Password storage**: bcrypt hash on registration and OTP verification
- **CORS**: Origin restricted to `http://localhost:5173` with `credentials: true`
- **Input validation**: Controllers check for required fields, types, and formats (e.g., DOB, reminder time)
- **Secrets**: `.env` variables for DB, JWT secret, AI/Email API keys

### 5.2 Scalability
- **Stateless API**: JWT allows horizontal scaling of the backend
- **Background work**: Cron decouples reminder computation from request path
- **Vector search**: Pinecone provides scalable semantic retrieval across entries
- **Modularity**: AI/email adapters can be swapped (e.g., different LLMs, SMTP providers)
- **Potential enhancements**:
  - Add Redis for rate limiting and caching (e.g., weekly trend aggregation)
  - Queue (e.g., BullMQ) for email/AI tasks instead of in‑process cron
  - Sharded or serverless Mongo; CDN for static assets

### 5.3 Extensibility
- **New endpoints**: Add route → controller → (optional) service; reuse middleware
- **New AI providers**: Implement adapter in `server/ai/` and switch imports
- **Additional stats**: Create controller methods that aggregate Mongo data; optional vector queries
- **Profile/Settings expansion**: Add new fields to `User` schema and surface CRUD endpoints


## 6. Interview Readiness

- **How to explain the architecture**
  - “The SPA talks to an Express API. Requests hit route modules, pass through a JWT middleware, and land in controllers that orchestrate Mongoose models and services. AI features are abstracted behind adapters. We also run a cron‑driven reminder service.”

- **Key terms to use**
  - “Separation of concerns,” “Single responsibility,” “Loose coupling,” “Abstraction,” “Stateless services,” “Defense in depth,” “Idempotent operations where applicable.”

- **Explain‑like‑I’m‑5 analogy**
  - “Think of Lumora as a library. The front desk (routes) checks your library card (JWT). The librarian (controller) knows who to ask: the catalog (models), the research assistant (AI services), or the mail room (email). At night, a clockwork helper (cron) sends reminder postcards to people who haven’t read today.”

- **What I’d highlight in an interview**
  - JWT‑based auth with clean middleware
  - Clear controller/service separation and provider adapters for AI/email
  - Vector‑backed context for AI chat grounded in journal entries
  - Cron‑driven reminders based on user settings and daily activity
  - Thoughtful edge‑case handling: OTP expiry, idempotent streaks, non‑blocking AI enrichments


## 7. API Reference (Concise)

- **Auth & Profile (public unless marked protected)**
  - `POST /api/request-otp` → start signup, send OTP
  - `POST /api/verify-otp` → complete signup, returns `{ token }`
  - `POST /api/register` → alternate simple registration (returns `{ token }`)
  - `POST /api/login` → returns `{ token }`
  - `GET /api/profile` (protected) → current profile
  - `PATCH /api/profile/name` (protected)
  - `PATCH /api/profile/dob` (protected)
  - `POST /api/profile/email/request-otp` (protected)
  - `POST /api/profile/email/verify-otp` (protected)
  - `DELETE /api/profile` (protected)

- **Journals (protected; all under `/api/journals`)**
  - `POST /` → create entry (AI summary + vector upsert)
  - `GET /` → list entries (desc)
  - `GET /today` → entries for today
  - `GET /stats/today-mood` → today’s mood/sentiment
  - `GET /stats/weekly-sentiment` → weekly trend
  - `GET /stats/streak` → streak data
  - `GET /:id` → entry by id
  - `PUT /:id` → update (re‑summarize + upsert)
  - `DELETE /:id` → delete

- **Chat (protected; all under `/api/chat`)**
  - `POST /session` → start new session (with optional `entryId`)
  - `POST /session/:id` → continue session
  - `GET /sessions` → list sessions
  - `GET /session/:id` → get one session (populated)
  - `DELETE /session/:id` → delete session
  - `POST /chat` → stateless single‑turn chat

- **Goals & Reminders (protected; under `/api/goals`)**
  - `POST /set` or similar → set goal (target days, reminder time, enabled)
  - `GET /` → get current goal with progress and flags
  - `POST /cancel` → cancel goal
  - `PATCH /reminder-settings` → update reminder time/enabled


## 8. Data Models (Essentials)

- **User**
  - `email`, `password`, `name`, optional `age`
  - `streakData`: `currentStreak`, `longestStreak`, `lastEntryDate`, `lastEntryCreatedAt`
  - `goalData`: `targetDays`, `startDate`, `endDate`, `isActive`, `lastReminderSent`, `reminderTime`, `reminderEnabled`

- **JournalEntry**
  - `title`, `content`, `user`, `createdForDate`
  - AI fields: `mood`, `summary`, `sentiment`, `intent`, `tags[]`, `embedding`, `metadata`

- **ChatSession**
  - `user`, optional `entry` ref, `title`, `messages[{ role: 'user'|'ai', content, timestamp }]`, `closed`, `summary`, `insights[]`

- **MemorySnapshot**
  - `user`, `source` ('chat'|'journal'), `sourceId` (refPath), `embedding`, `content`, `tags[]`, `createdAt`


## 9. Environment Variables

- Database & Auth
  - `MONGO_URI`, `JWT_SECRET`
- AI
  - `COHERE_API_KEY`, `PINECONE_API_KEY`, `PINECONE_HOST`, `GROQ_API_KEY`
- Email
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
  - Optional Gmail fallback: `GMAIL_USER`, `GMAIL_APP_PASSWORD`


## 10. Local Development

- Start backend: from `server/`, `npm run dev` (nodemon loads `app.js`)
- Start frontend: from `client/`, `npm run dev` (Vite; proxy for `/api`)
- Access SPA at `http://localhost:5173`


## 11. Future Improvements

- Add robust request schema validation (e.g., Zod/Joi) and structured error responses
- Introduce background job queue (BullMQ) for AI/email workloads
- Implement refresh tokens and token rotation
- Add rate limiting and audit logging
- Expand analytics: tag frequency, topic clusters, anomaly detection 