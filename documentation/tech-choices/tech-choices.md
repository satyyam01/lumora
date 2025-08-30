# Tech Choices and Architecture Rationale

This document summarizes the major technologies, frameworks, libraries, and services used across the Lumora codebase, with interview-ready justifications, trade-offs, architectural roles, and future considerations.

## Node.js + Express 5 (Backend API)

- Why it was a good fit
  - Lightweight, flexible HTTP framework with a rich middleware ecosystem
  - Fast developer iteration; simple to model REST endpoints for journals, chat, goals, auth
  - Works well with JavaScript end-to-end (frontend + backend)
- Alternatives considered
  - NestJS: opinionated, DI + decorators; heavier scaffold for a small team
  - Fastify: faster baseline but fewer built-in examples/ecosystem familiarity
  - Next.js API routes: tied to React app, we preferred a separate backend
- Trade-offs accepted
  - Minimal structure requires discipline around architecture and conventions
  - Express 5 (latest) introduces subtle breaking changes during migration
- Architectural role & interactions
  - Hosts controllers (`auth`, `journal`, `chat`, `goal`) and middleware (`auth`)
  - Integrates cron jobs, AI adapters (Cohere, Pinecone, Groq), email service, and MongoDB via Mongoose
- Future considerations
  - Consider NestJS if team scales and needs opinionated modules/testing patterns
  - Add rate limiting (Express middleware + Redis) and structured logging

## MongoDB Atlas + Mongoose (Database & ODM)

- Why it was a good fit
  - Flexible document model for journal entries, chat sessions, and user profiles
  - Mongoose schemas/validators simplify data modeling and relationships
- Alternatives considered
  - PostgreSQL + Prisma: strong relational integrity; heavier upfront schema planning
  - DynamoDB: scalable but requires careful partition design; less friendly for ad hoc queries
- Trade-offs accepted
  - Complex relational queries are less ergonomic vs SQL
  - ODM abstraction sometimes hides driver-level performance tuning
- Architectural role & interactions
  - Models: `User`, `JournalEntry`, `ChatSession`, `MemorySnapshot`
  - Controllers orchestrate CRUD, streak logic, goal state, and selection for reminders
- Future considerations
  - Add indexes for frequent queries (date ranges, userId)
  - Consider PostgreSQL for analytics; keep MongoDB for content

## JSON Web Tokens (JWT) for Auth

- Why it was a good fit
  - Stateless authentication enables simple horizontal scaling
  - Easy to integrate with frontend via `Authorization: Bearer` header
- Alternatives considered
  - Session-based auth (express-session + Redis): server memory + infra overhead
  - OAuth providers: overkill for email/password + OTP flow
- Trade-offs accepted
  - Token revocation is non-trivial; must manage expiry and rotation
- Architectural role & interactions
  - `middleware/auth.js` verifies tokens and attaches `req.user`
  - Secures journal, chat, goals, and profile endpoints
- Future considerations
  - Add refresh tokens and key rotation; consider JTI allowlist on logout

## Bcrypt (Password Hashing)

- Why it was a good fit
  - Battle-tested library for hashing passwords with salt
- Alternatives considered
  - Argon2: stronger default parameters but adds native build/runtime considerations
- Trade-offs accepted
  - Slightly slower than modern Argon2 choices; still widely accepted
- Architectural role & interactions
  - Used during registration and OTP verification when creating users
- Future considerations
  - Migrate to Argon2id with reasonable defaults if security requirements increase

## Node-Cron (Background Scheduling)

- Why it was a good fit
  - Simple, in-process cron for periodic reminder checks
- Alternatives considered
  - BullMQ/Agenda + Redis: more robust job queues but adds infra
  - Cloud schedulers (Cloud Scheduler/CloudWatch): external dependency + setup
- Trade-offs accepted
  - Single-process cron lacks distributed coordination/failover
- Architectural role & interactions
  - Triggers `reminderService.sendDailyReminders()` every 5 minutes (IST)
  - Pulls goal state and emails users as needed
- Future considerations
  - Move to a worker + queue for reliability and observability; add distributed locks

## Nodemailer (Email Sending)

- Why it was a good fit
  - Direct SMTP support; flexible transporter config (custom SMTP + Gmail fallback)
  - Fine-grained control over retries, timeouts, TLS
- Alternatives considered
  - SendGrid/Postmark/SES SDKs: managed deliverability and dashboards; paid/vendor lock-in
- Trade-offs accepted
  - Must manage deliverability and reputation ourselves; less insight than managed ESPs
- Architectural role & interactions
  - `emailService.js` builds transporters and handles retries/backoff
  - Used by reminder service and OTP flows with HTML templates
- Future considerations
  - Switch to SES/SendGrid for scale, analytics, bounce handling, and compliance

## Axios (HTTP Client)

- Why it was a good fit
  - Promise-based HTTP client with clean interceptors, used for AI and Pinecone APIs
- Alternatives considered
  - Native fetch: simpler but less ergonomic for Node before v18 stabilization
  - Got: solid choice; axios was already familiar to the team
- Trade-offs accepted
  - Slightly larger dependency; careful error handling required
- Architectural role & interactions
  - AI adapters (`cohere`, `pinecone`, `llm`) and other external HTTP calls
- Future considerations
  - Standardize error wrapping, timeouts, and retries per service adapter

## Cohere Embeddings (AI Vectorization)

- Why it was a good fit
  - High-quality `embed-english-v3.0` 1024-dim vectors suitable for semantic search
- Alternatives considered
  - OpenAI text-embedding-3-large/small: strong quality; pricing and policy considerations
  - SentenceTransformers (local): zero vendor dependency; ops burden and model hosting
- Trade-offs accepted
  - Vendor dependency and API limits; per-request latency and cost
- Architectural role & interactions
  - Used in `journalController` and `chatController` to vectorize text and queries
  - Feeds Pinecone upserts and queries for RAG
- Future considerations
  - Cache repeated embeddings; evaluate hybrid search (BM25 + vectors)

## Pinecone (Vector Database)

- Why it was a good fit
  - Managed vector store with fast similarity search and metadata filtering
- Alternatives considered
  - pgvector (Postgres), Weaviate, Qdrant, Milvus, Elasticsearch/OpenSearch kNN
- Trade-offs accepted
  - Vendor lock-in; separate data store introduces consistency concerns
- Architectural role & interactions
  - Stores embeddings and rich metadata; queried for journal context in RAG flows
- Future considerations
  - Enforce per-user namespaces or metadata filters; periodic cleanup jobs

## Groq LLM (Llama 3.3 70B)

- Why it was a good fit
  - Fast inference and competitive quality; good for summarization and empathetic chat
- Alternatives considered
  - OpenAI/Claude: excellent quality; higher cost and stricter usage policies
  - Local LLMs: infra/ops complexity and latency concerns
- Trade-offs accepted
  - Vendor dependency and prompt-format coupling
- Architectural role & interactions
  - `llm.js` wraps summarization (`callLLM`) and chat (`callChat`)
  - Consumes Pinecone-retrieved context and conversation history
- Future considerations
  - Prompt evaluation harness; fallback models; cost control and caching

## React 19 (Frontend)

- Why it was a good fit
  - Mature ecosystem; component model maps well to the app’s UI (journals, chat, profile)
- Alternatives considered
  - Vue/Svelte: great DX; team familiarity and library availability favored React
  - Next.js SSR/SSG: not required; SPA sufficed for this phase
- Trade-offs accepted
  - SPA requires dedicated API and careful SEO handling
- Architectural role & interactions
  - Screens and components for journal CRUD, weekly trends, chat UX, goals and profile
  - Talks to backend REST APIs; stores auth token in browser storage
- Future considerations
  - Introduce React Query for data caching and background refetch
  - Evaluate Next.js (partial SSR) for SEO-sensitive pages

## Vite (Build Tool & Dev Server)

- Why it was a good fit
  - Super-fast HMR and builds; modern ESM-first toolchain
- Alternatives considered
  - CRA (deprecated), Webpack: heavier config and slower iteration
- Trade-offs accepted
  - Some ecosystem plugins less mature compared to Webpack
- Architectural role & interactions
  - Local dev server on `5173` with CORS to backend `3000`
- Future considerations
  - Keep Vite; consider Vitest/Playwright for tests

## React Router DOM 7

- Why it was a good fit
  - Clean, declarative routing and nested layouts for SPA flows
- Alternatives considered
  - Next Router (requires Next); Wouter (minimal)
- Trade-offs accepted
  - Client-side routing only; no SSR routing primitives
- Architectural role & interactions
  - Drives navigation across journals, chat, goals, profile pages
- Future considerations
  - Add route-level data loaders or React Query integration

## Tailwind CSS + Radix UI + Lucide Icons

- Why it was a good fit
  - Rapid UI development with utility classes; accessible primitives (Radix);
    consistent iconography (Lucide)
- Alternatives considered
  - Chakra UI/MUI: component-heavy; Tailwind offered more control and bundle efficiency
  - Styled-components/Emotion: ergonomics vs. runtime cost and style scoping
- Trade-offs accepted
  - Utility-first CSS requires discipline to avoid style duplication
- Architectural role & interactions
  - Provides design system, theme, and dark mode via `ThemeProvider`
- Future considerations
  - Extract common UI patterns into reusable components; design tokens

## date-fns + date-fns-tz + moment-timezone

- Why it was a good fit
  - Robust timezone handling (IST) and date math for streaks, reminders, trends
- Alternatives considered
  - Luxon/Day.js: viable; team had existing moment-timezone utilities
- Trade-offs accepted
  - Mixing libraries requires consistency rules to avoid subtle bugs
- Architectural role & interactions
  - Back-end uses moment-timezone for IST windows; front-end uses date-fns(-tz) for display
- Future considerations
  - Consolidate on one library (e.g., date-fns-tz) to reduce mental overhead

## ESLint (Linting)

- Why it was a good fit
  - Enforces consistency and catches common pitfalls in React/Node
- Alternatives considered
  - StandardJS, Rome (early): ESLint’s ecosystem is most mature
- Trade-offs accepted
  - Must maintain config; occasional false positives
- Architectural role & interactions
  - Runs locally via scripts; aligns client and server code styles
- Future considerations
  - Add Prettier or adopt ESLint formatting rules consistently

## TypeScript (Tooling Only)

- Why it was a good fit
  - Types available for React/Vite; incremental typing potential without full conversion
- Alternatives considered
  - Full TS migration: more effort; phased approach chosen
- Trade-offs accepted
  - Limited type safety across the app until full migration
- Architectural role & interactions
  - Present in devDeps; not enforced in runtime code yet
- Future considerations
  - Gradual migration of models, controllers, and hooks to TS

## dotenv + CORS (Infra Plumbing)

- Why it was a good fit
  - `.env` for secrets; CORS for local dev (`5173` ⇄ `3000`)
- Alternatives considered
  - Config services (Vault/SSM): heavier ops; not needed initially
- Trade-offs accepted
  - Manual secret management; risk if not standardized across environments
- Architectural role & interactions
  - Loads environment config; exposes backend to SPA origin during dev
- Future considerations
  - Centralized secret management and env validation; stricter CORS in prod

## Email Templates (Custom HTML)

- Why it was a good fit
  - Full control over branding and responsive layouts for OTP and reminders
- Alternatives considered
  - Template services (MJML, SendGrid templates): reduces control but increases velocity
- Trade-offs accepted
  - Manual CSS-inlined layouts and testing across clients
- Architectural role & interactions
  - `otp.js` and `notification.js` produce HTML consumed by `emailService`
- Future considerations
  - Adopt MJML or an ESP template system for iteration and A/B testing

## Overall Architecture Notes

- SPA frontend (React/Vite) talking to a stateless API (Express/JWT)
- MongoDB as system of record; Pinecone as vector search index; AI adapters (Cohere/Groq) for RAG
- Cron-based reminder subsystem invoking email infrastructure
- Clear separation of concerns: controllers, AI adapters, services, utils, models

## Future Platform Considerations

- Add Redis for caching, rate limiting, and queues (BullMQ) for reminders/AI tasks
- Observability: request tracing, metrics, and structured logs across AI calls
- Security: token rotation, per-user Pinecone filtering/namespacing, secret management
- CI/CD: lint/test pipelines, containerization, and environment promotion
- Testing: unit for controllers/services, integration for AI adapters with mocks 