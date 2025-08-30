# Journal Controller Documentation

The `journalController.js` file handles all journal entry operations including creation, retrieval, updates, deletion, and AI-powered analysis. It integrates with AI services for summarization, sentiment analysis, and vector embeddings for semantic search capabilities.

## Functions

### updateUserStreak (Helper Function)

**Function Overview**
- Updates user streak data when journal entries are created
- Calculates consecutive days of journaling
- Handles streak breaks and resets
- Updates longest streak records
- Manages timezone-aware date comparisons
- Critical for the streak system functionality

**API Details**
- **Endpoint**: N/A (internal helper function)
- **Access Control**: N/A (internal function)
- **Parameters**: `userId`, `entryDate`, `createdAt`

**Dependencies**
- **Models**: `User` model for streak data updates
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex date handling logic for streak calculations
- Critical preservation of `createdAt` timestamps for streak accuracy
- Timezone considerations for consistent streak tracking

---

### createEntry

**Function Overview**
- Creates a new journal entry with title, content, and optional date
- Updates user streak data automatically
- Triggers AI-powered summarization and analysis
- Generates vector embeddings for semantic search
- Stores entry metadata in Pinecone vector database
- Handles AI processing errors gracefully without blocking user operations

**API Details**
- **Endpoint**: `POST /api/journal/entries`
- **Access Control**: Authenticated users only
- **Request Body**: `{ title, content, createdForDate? }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry creation, `User` for streak updates
- **Utilities**: `summarize.js` for AI summarization, `cohere.js` for embeddings, `pinecone.js` for vector storage
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Critical preservation of `createdAt` timestamp for streak system
- AI processing errors are logged but don't block user operations
- Complex integration between journal creation and AI analysis pipeline

---

### getEntries

**Function Overview**
- Retrieves all journal entries for the authenticated user
- Returns entries sorted by creation date (newest first)
- Provides complete entry data including AI-generated analysis

**API Details**
- **Endpoint**: `GET /api/journal/entries`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for data retrieval
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard database query with user isolation

---

### getEntryById

**Function Overview**
- Retrieves a single journal entry by ID
- Ensures the entry belongs to the authenticated user
- Returns 404 if entry not found or doesn't belong to user

**API Details**
- **Endpoint**: `GET /api/journal/entries/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry retrieval
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard user isolation and error handling

---

### updateEntry

**Function Overview**
- Updates an existing journal entry's title and content
- Re-triggers AI analysis and summarization
- Updates vector embeddings in Pinecone
- Preserves original creation timestamp for streak accuracy
- Ensures user ownership of the entry

**API Details**
- **Endpoint**: `PUT /api/journal/entries/:id`
- **Access Control**: Authenticated users only
- **Request Body**: `{ title, content }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry updates
- **Utilities**: `summarize.js` for AI summarization, `cohere.js` for embeddings, `pinecone.js` for vector updates
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Critical preservation of `createdAt` timestamp for streak system
- AI processing errors are logged but don't block user operations
- Complex integration between entry updates and AI analysis pipeline

---

### deleteEntry

**Function Overview**
- Deletes a journal entry by ID
- Ensures the entry belongs to the authenticated user
- Returns 404 if entry not found or doesn't belong to user

**API Details**
- **Endpoint**: `DELETE /api/journal/entries/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry deletion
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Note: Deleted entries are not removed from Pinecone vector database (potential data inconsistency)

---

### getTodaysEntries

**Function Overview**
- Retrieves all journal entries created for today's date
- Uses date range filtering (start of day to end of day)
- Returns entries sorted by creation time (newest first)
- Supports timezone-aware date handling

**API Details**
- **Endpoint**: `GET /api/journal/entries/today`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry retrieval
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Date range filtering ensures accurate "today" results

---

### getTodayMood

**Function Overview**
- Retrieves the most recent mood and sentiment data for today
- Filters entries by date and ensures mood/sentiment data exists
- Returns null values if no mood data is available for today
- Useful for dashboard mood tracking

**API Details**
- **Endpoint**: `GET /api/journal/entries/today/mood`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for mood data retrieval
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Returns null for both mood and sentiment if either is missing

---

### getWeeklySentimentTrend

**Function Overview**
- Retrieves sentiment data for the past 7 days
- Uses IST timezone for consistent day boundaries
- Returns sentiment values for each day (null if no entry)
- Handles timezone conversion between IST and UTC
- Provides data for weekly sentiment visualization

**API Details**
- **Endpoint**: `GET /api/journal/entries/weekly-sentiment`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for sentiment data retrieval
- **Utilities**: `moment-timezone` for timezone handling
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex timezone handling between IST and UTC
- Critical for accurate weekly trend calculations
- Uses hardcoded IST timezone ('Asia/Kolkata')

---

### getStreakData

**Function Overview**
- Retrieves comprehensive user streak information
- Calculates current streak, longest streak, and weekly progress
- Automatically resets streaks if more than 1 day has passed
- Updates user streak data in real-time
- Provides streak statistics for goal tracking

**API Details**
- **Endpoint**: `GET /api/journal/entries/streak`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `User` for streak data, `JournalEntry` for weekly counting
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex streak calculation logic
- Automatic streak reset functionality
- Weekly entry counting for progress tracking

---

### chatWithJournal

**Function Overview**
- Provides AI-powered chat functionality with journal context
- Generates embeddings for user messages
- Queries Pinecone for relevant journal entries
- Formats context for LLM processing
- Returns AI-generated responses based on journal history
- Enables conversational journal analysis

**API Details**
- **Endpoint**: `POST /api/journal/chat`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: None (uses Pinecone for entry retrieval)
- **Utilities**: `cohere.js` for embeddings, `pinecone.js` for vector search, `llm.js` for AI responses
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex AI pipeline integration
- Vector search relevance depends on embedding quality
- LLM response generation based on retrieved context 