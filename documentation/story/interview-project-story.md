# Lumora: Interview Project Story

## Short Version (30 seconds)

**Problem**: People struggle to maintain consistent journaling habits and miss valuable insights from their entries. Traditional journaling apps are just text editors - they don't help users understand patterns or stay motivated.

**Solution**: I built Lumora, an AI-powered wellness journaling app that automatically analyzes entries for emotional patterns, provides context-aware AI conversations, and sends intelligent reminders to build lasting habits.

**Architecture**: React frontend with a Node.js/Express backend, MongoDB for persistence, and a sophisticated AI pipeline using Cohere embeddings, Pinecone vector database, and Groq LLM. The system includes timezone-aware streak tracking and an intelligent reminder service that runs on cron jobs.

**Key Features**: Real-time AI analysis of journal entries, semantic search across past entries, personalized AI conversations with memory, and a gamified streak system that handles complex timezone logic.

---

## Extended Version (2 minutes)

### The Problem
I noticed that while many people want to journal consistently, they struggle with three main challenges: maintaining the habit, extracting meaningful insights from their entries, and staying motivated over time. Traditional journaling apps are essentially glorified text editors - they don't help users understand emotional patterns, provide context, or encourage continued engagement. Users end up with hundreds of entries but no way to see the bigger picture of their emotional journey.

### The Solution
I built Lumora, a comprehensive wellness journaling platform that transforms raw journal entries into actionable insights. The app automatically analyzes each entry using AI to extract mood, sentiment, and key themes, then stores these insights in a vector database for semantic search. Users can have meaningful conversations with an AI that remembers and references their past entries, creating a truly personalized experience.

### Technical Architecture
The system is built in layers, starting with a React frontend that provides an intuitive journaling interface. The backend is a Node.js/Express API with JWT authentication and middleware-based authorization. Data persistence is handled by MongoDB with Mongoose ODM, but here's where it gets interesting - I implemented a sophisticated AI pipeline that processes every journal entry in real-time.

When a user writes an entry, the system simultaneously generates a summary using Groq's LLM, creates vector embeddings via Cohere's API, and stores these in Pinecone's vector database. This enables semantic search across thousands of entries in sub-second response times.

### Key Engineering Challenges
One of the most complex features is the timezone-aware streak system. Users can be anywhere in the world, but the streak logic needs to work consistently. I solved this by standardizing all dates to Indian Standard Time, converting to UTC for storage, and implementing precise day boundary calculations that handle daylight saving time and leap years correctly.

The intelligent reminder system runs as a background service using node-cron, processing users every 5 minutes. It implements complex eligibility logic - checking if users have active goals, whether they've journaled today, and if they're within their preferred reminder window. The system prevents duplicate reminders and includes robust email delivery with exponential backoff retry logic.

### AI Integration Complexity
The RAG pipeline was particularly challenging. I had to coordinate multiple AI services synchronously - Cohere for embeddings, Pinecone for vector storage, and Groq for text generation. The system maintains data consistency between MongoDB entries and Pinecone vectors, handles AI service failures gracefully, and ensures user privacy by isolating vectors by user ID.

### What Makes This Impressive
This isn't just a CRUD app - it's a production-ready system with sophisticated AI integration, complex business logic, and robust error handling. The timezone-aware streak system alone demonstrates advanced date/time handling that most developers struggle with. The intelligent reminder service shows understanding of background job processing and service architecture. And the AI pipeline showcases modern ML/AI integration patterns that are increasingly important in today's applications.

The project demonstrates full-stack development skills, system design thinking, and the ability to integrate complex external services while maintaining code quality and user experience. It's the kind of project that shows you can build real-world applications, not just tutorial examples. 