# Lumora: Cron Architecture and RAG Flow

## 1) Overview

This document explains two core subsystems in Lumora:
- Cron-based Reminder Architecture (daily nudges to journal)
- Retrieval-Augmented Generation (RAG) for AI chat and contextual insights

Both subsystems are designed with separation of concerns, loose coupling, and clear abstractions to enable maintainability and scale.


## 2) Cron Architecture (Reminder System)

### 2.1 Components
- `server/app.js`
  - Schedules a job: every 5 minutes, timezone `Asia/Kolkata` (IST)
  - On server start: connects to MongoDB, starts HTTP server, and starts the cron
- `server/services/reminderService.js`
  - Orchestrates reminder checks and email sending
  - Manages its own MongoDB connection lifecycle (connect/disconnect)
  - For each user needing a reminder: composes HTML and sends via email, marks reminder as sent
- `server/controllers/goalController.js`
  - `checkReminders(currentTime)` returns the list of users who should receive reminders now
  - Reminder selection rules:
    - User has an active goal and reminders enabled
    - No entry created today (IST day window)
    - No reminder already sent today
    - Current time is within 30 minutes of the user’s configured `reminderTime` (HH:MM)
  - `markReminderSent(userId)` persists the last reminder timestamp
- `server/utils/emailService.js`
  - `sendEmail` implements retries with exponential backoff
  - Uses SMTP if `EMAIL_HOST` is set, otherwise Gmail fallback
  - Templates: OTP and goal reminder

### 2.2 Schedule & Timezone
- Cron expression: `*/5 * * * *`
- Timezone: `Asia/Kolkata`
- Runs every 5 minutes to check if any user is within the reminder window and eligible

### 2.3 End-to-End Flow (Sequence)

```
[cron/node-cron @ app.js]
        └── (every 5 min, IST)
            └─> reminderService.sendDailyReminders(now)
                ├─> reminderService.connect()  // ensure DB connection
                ├─> goalController.checkReminders(now)
                │    ├─> Query User.goalData (active + reminders enabled)
                │    ├─> For each user: has not journaled today (IST)?
                │    ├─> Was reminder already sent today?
                │    └─> Is current time within 30 min of reminderTime?
                ├─> For each selected user:
                │    ├─> emailService.sendEmail(goalReminderHTML)
                │    └─> goalController.markReminderSent(userId)
                └─> Aggregate logs: success / failure counts
```

### 2.4 Error Handling & Idempotency
- Email sending: `sendEmail` has retry with exponential backoff
- If email ultimately fails, user remains eligible on the next cron tick
- `markReminderSent` occurs only after successful send → avoids duplicate same-day sends
- If cron runs multiple times during the same window, `lastReminderSent` prevents duplicates

### 2.5 Observability
- Structured logs in `reminderService`: job start/end, counts of successes/failures
- Logs email configuration source (SMTP vs Gmail fallback)

### 2.6 Scaling & Hardening
- Horizontally scaling API nodes: ideally run cron on a single worker (or use a distributed lock)
- Move work off-process via a queue (e.g., BullMQ/Redis) for resilience and throughput
- Add metrics: sent counts, error rates, delivery times
- Rate limits/delivery caps to avoid provider throttling
- Tenant routing: shard reminder checks if user base grows

### 2.7 Configuration
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` (fallback)
- `MONGO_URI`
- Goal defaults: reminder time format (`HH:MM` at 30-min granularity)


## 3) RAG Architecture (Retrieval-Augmented Generation)

RAG enables the AI assistant to ground responses in the user’s past journal entries.

### 3.1 Components
- `server/controllers/journalController.js`
  - On create/update:
    - Summarizes entry content (LLM) to produce: `summary`, `mood`, `sentiment`, `intent`, `tags`, `bullets`
    - Embeds bullet text using Cohere
    - Upserts the vector + metadata into Pinecone
- `server/ai/cohere.js`
  - `embedTextWithCohere(text)` → returns embedding vector
- `server/ai/pinecone.js`
  - `upsertToPinecone({ id, embedding, metadata, namespace })`
  - `queryPinecone({ embedding, topK, namespace })`
  - `deleteUserVectorsFromPinecone(userId)`
- `server/controllers/chatController.js`
  - `startChatSession` (entry-specific or global)
  - `continueChatSession` (multi-turn with recent history)
  - `chatWithJournal` (stateless single-turn)
- `server/ai/llm.js`
  - `callLLM(prompt)` for summarization
  - `callChat(input)` for conversations (string prompt or messages[])

### 3.2 Write Path (Ingestion)

```
Frontend → POST /api/journals (title, content, createdForDate)
  └─> journalController.createEntry
       ├─> Save JournalEntry in Mongo
       ├─> Update streak data on User
       ├─> Summarize content via LLM → {summary, mood, intent, tags, bullets, sentiment}
       ├─> Embed bullets with Cohere → embedding[]
       └─> Pinecone.upsert({
             id: entry._id,
             values: embedding,
             metadata: {
               entryId, userId, date, title, summary, bullets, tags, sentiment, intent
             },
             namespace: 'default'
           })
```

Notes:
- On update, the controller re-summarizes and re-upserts vectors
- Preserves `createdAt` to protect streak integrity

### 3.3 Read Path (Query)

#### A) Entry-specific Chat
- Request includes `entryId`
- Controller fetches that entry (ownership-checked) and builds context directly from its `title` and `content`
- Calls `callChat(prompt)` and persists the session

```
POST /api/chat/session { message, entryId }
  └─> chatController.startChatSession
       ├─> JournalEntry.findOne({ _id: entryId, user: userId })
       ├─> Context ← entry.title + entry.content
       ├─> Prompt(template + context + user message)
       ├─> callChat(prompt) → aiResponse
       └─> Save ChatSession(messages) → return sessionId + messages
```

#### B) Global Chat (RAG)
- Request omits `entryId`
- Controller embeds the user’s message with Cohere
- Queries Pinecone for top K matches (currently unfiltered by user; see improvement below)
- Builds a context string from Pinecone matches’ metadata (date, summary, bullets)
- Calls `callChat(prompt)` and persists the session

```
POST /api/chat/session { message }
  └─> chatController.startChatSession
       ├─> embedding ← Cohere.embed(message)
       ├─> matches ← Pinecone.query({ embedding, topK: 5, namespace: 'default' })
       ├─> context ← format(matches.metadata: date/summary/bullets)
       ├─> Prompt(template + context + user message)
       ├─> callChat(prompt) → aiResponse
       └─> Save ChatSession(messages) → return sessionId + messages
```

#### C) Stateless Chat
- Same as global chat retrieval, but no `ChatSession` persistence

### 3.4 Prompting Patterns
- Summarization prompt (LLM) produces concise, emotionally-aware bullets and metadata
- Chat prompts enforce empathetic, grounded tone and explicit use of retrieved context
- Multi-turn path passes recent history as messages to `callChat({ messages })`

### 3.5 Metadata & Indexing Strategy
- Pinecone vector metadata stored on upsert: `entryId`, `userId`, `date`, `title`, `summary`, `bullets`, `tags`, `sentiment`, `intent`
- Current namespace: `'default'`
- TopK: 5 (tunable)

### 3.6 Security & Privacy Considerations
- Recommend filtering Pinecone queries by `userId` (server-side) to prevent any cross-user leakage, e.g.:
  - Use a namespacing strategy per user (e.g., namespace = userId) OR
  - Use Pinecone metadata `filter: { userId }` during query
- Ensure all chat/journal routes are JWT protected (already implemented)
- Avoid sending raw PII to LLMs where unnecessary; prefer summarized/contextual forms

### 3.7 Performance Tuning
- `topK` balancing precision/latency; consider reranking with cross-encoder if needed
- Chunking: for long entries, consider chunked embeddings vs. bullet summaries
- Caching: memoize embeddings for identical inputs; cache frequent Pinecone queries
- Backpressure: rate limit chat and summarization requests

### 3.8 Failure Modes & Resilience
- Cohere errors → logged and surfaced; journal save proceeds (enrichment is best-effort)
- Pinecone upsert/query errors → logged; chat falls back to non-RAG or returns error
- LLM errors → logged; controller returns 500 with safe message
- Timeouts → set sensible client and provider timeouts; retry selectively

### 3.9 Testing & Observability
- Log timing for embed/query/LLM sections
- Add synthetic tests for summarization structure and Pinecone metadata shape
- Consider tracing across controllers and AI adapters for E2E latency breakdown


## 4) Side-by-side Summary

- Cron subsystem: periodic push notifications (email) driven by user goal state and daily activity
- RAG subsystem: on-demand retrieval of semantically relevant journal context to ground AI responses

```
Cron (push)                    RAG (pull)
-------------                 --------------------------
Timer → Select users    vs.   User message → Embed → Retrieve → Chat
Email → Mark sent              Save session (multi-turn) or return (stateless)
```


## 5) Suggested Improvements (Roadmap)

- Cron
  - Move to a dedicated worker with a distributed lock/queue
  - Add per-user quiet hours, weekend toggles, and per-day schedules
  - Add metrics and alerting for delivery failures

- RAG
  - Enforce per-user filtering in Pinecone (namespace or `filter: { userId }`)
  - Introduce hybrid search (keyword + vector) and reranking
  - Add summarization caching and offline precomputation
  - Implement evaluation harness for prompt quality and context usefulness


## 6) Configuration Cheat Sheet

- Database & Auth: `MONGO_URI`, `JWT_SECRET`
- Embeddings & Vectors: `COHERE_API_KEY`, `PINECONE_API_KEY`, `PINECONE_HOST`
- LLM: `GROQ_API_KEY`
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (or `GMAIL_USER`, `GMAIL_APP_PASSWORD`) 