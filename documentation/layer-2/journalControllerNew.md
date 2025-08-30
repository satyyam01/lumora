# Journal Controller Documentation (LangGraph Migration)

The `journalController.js` file handles all journal entry operations including creation, retrieval, updates, deletion, and AI-powered analysis. With the migration to LangGraph, the AI processing pipeline now uses sophisticated graph-based workflows for enhanced summarization, sentiment analysis, and vector embeddings.

## Architecture Overview

**Primary Engine**: LangGraph-based summarization system (`summarizeGraph.invoke`)
**Fallback Engine**: Legacy AI system (when `LLM_ENGINE !== 'langgraph'`)
**Integration**: Seamlessly switches between engines based on environment configuration

**Current Import Status**: 
- **LangGraph**: `summarizeGraph` from `../langgraph/summarizeGraph`
- **Legacy AI**: `summarizeJournalEntry`, `embedTextWithCohere`, `upsertToPinecone`, `callLLM` (all still imported and used in fallback mode)

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

**Status**: ✅ **Active** - Core streak functionality

---

### createEntry

**Function Overview**
- Creates a new journal entry with title, content, and optional date
- Updates user streak data automatically
- Triggers AI-powered summarization and analysis via LangGraph
- Generates vector embeddings for semantic search
- Stores entry metadata in Pinecone vector database
- Handles AI processing errors gracefully without blocking user operations

**API Details**
- **Endpoint**: `POST /api/journal/entries`
- **Access Control**: Authenticated users only
- **Request Body**: `{ title, content, createdForDate? }`
- **Request Headers**: `Authorization: Bearer <token>`

**LangGraph Flow** (Primary Path)
1. Routes to `summarizeGraph.invoke` for AI processing
2. Processes through LangGraph nodes: `summarize` → `embedBullets` → `upsertPinecone` → `persistSummary`
3. **Uses LangChain's `CohereEmbeddings` wrapper** (not `cohere.js`)
4. **Uses custom `pineconeUpsert` function** (not `pinecone.js`)
5. Returns enhanced entry with AI analysis

**Legacy Flow** (Fallback)
1. Manual AI summarization via `summarizeJournalEntry`
2. Manual embedding generation via Cohere
3. Manual Pinecone vector storage
4. Direct database updates

**Dependencies**
- **Models**: `JournalEntry` for entry creation, `User` for streak updates
- **LangGraph**: `summarizeGraph.invoke` (primary)
- **Legacy AI**: `summarize.js`, `cohere.js`, `pinecone.js` (fallback)

**Status**: ✅ **Active** - Primary entry creation with LangGraph integration

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
- **AI Services**: None

**Status**: ✅ **Active** - Standard data retrieval

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
- **AI Services**: None

**Status**: ✅ **Active** - Standard entry retrieval

---

### updateEntry

**Function Overview**
- Updates an existing journal entry's title and content
- Re-triggers AI analysis and summarization via LangGraph
- Updates vector embeddings in Pinecone
- Preserves original creation timestamp for streak accuracy
- Ensures user ownership of the entry

**API Details**
- **Endpoint**: `PUT /api/journal/entries/:id`
- **Access Control**: Authenticated users only
- **Request Body**: `{ title, content }`
- **Request Headers**: `Authorization: Bearer <token>`

**LangGraph Flow** (Primary Path)
1. Routes to `summarizeGraph.invoke` for AI reprocessing
2. Processes through LangGraph workflow for updated analysis
3. **Uses LangChain's `CohereEmbeddings` wrapper** (not `cohere.js`)
4. **Uses custom `pineconeUpsert` function** (not `pinecone.js`)
5. Updates Pinecone vectors and database with new insights

**Legacy Flow** (Fallback)
1. Manual AI reprocessing via `summarizeJournalEntry`
2. Manual embedding regeneration and Pinecone updates
3. Direct database updates

**Dependencies**
- **Models**: `JournalEntry` for entry updates
- **LangGraph**: `summarizeGraph.invoke` (primary)
- **Legacy AI**: `summarize.js`, `cohere.js`, `pinecone.js` (fallback)

**Status**: ✅ **Active** - Entry updates with LangGraph integration

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
- **AI Services**: None

**Bugs or Development Challenges**
- **Critical Issue**: Deleted entries are not removed from Pinecone vector database
- **Impact**: Creates data inconsistency between MongoDB and Pinecone
- **Recommendation**: Implement Pinecone cleanup in delete operations

**Status**: ✅ **Active** - Entry deletion (with data inconsistency issue)

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
- **AI Services**: None

**Status**: ✅ **Active** - Date-based entry retrieval

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
- **AI Services**: None

**Status**: ✅ **Active** - Mood tracking functionality

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
- **AI Services**: None

**Bugs or Development Challenges**
- Complex timezone handling between IST and UTC
- Critical for accurate weekly trend calculations
- Uses hardcoded IST timezone ('Asia/Kolkata')

**Status**: ✅ **Active** - Weekly sentiment analysis

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
- **AI Services**: None

**Status**: ✅ **Active** - Streak calculation and tracking

---

### chatWithJournal

**Function Overview**
- **DEPRECATED** - Replaced by LangGraph-based chat system in `chatController.js`
- Legacy chatbot endpoint for direct journal queries
- Still functional but not recommended for new development
- **Note**: This function still uses legacy AI utilities and has NOT been updated to use LangGraph

**API Details**
- **Endpoint**: `POST /api/journal/chat`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message }`
- **Request Headers**: `Authorization: Bearer <token>`

**Legacy Flow**
1. Manual embedding generation via Cohere
2. Pinecone vector search for relevant entries
3. Context assembly and LLM prompt building
4. Direct LLM call via `callLLM`

**Dependencies**
- **Legacy AI**: `cohere.js`, `pinecone.js`, `llm.js`
- **AI Services**: None

**Status**: ⚠️ **Deprecated** - Use `chatController.js` functions instead

---

## LangGraph Integration

### summarizeGraph.invoke

**Primary AI Processing Engine**
- **Location**: `server/langgraph/summarizeGraph.js`
- **Workflow**: StateGraph-based AI analysis pipeline
- **Nodes**: `summarize` → `embedBullets` → `upsertPinecone` → `persistSummary`

**Key Features**
- Structured JSON output with Zod validation
- Automatic bullet point embedding generation
- Pinecone vector database integration
- Database persistence with timestamp preservation
- Error handling and validation

**Input Parameters**
```javascript
{
  userId: 'string',
  entryId: 'string',
  title: 'string',
  content: 'string'
}
```

**Output Structure**
```javascript
{
  summary: 'string',
  bullets: ['string'],
  mood: 'string',
  tags: ['string'],
  sentiment: 'string',
  intent: 'string'
}
```

---

## Redundant Functions (Post-LangGraph Migration)

### ❌ **DEPRECATED Functions**

1. **`chatWithJournal`**
   - **Reason**: Superseded by LangGraph-based chat system in `chatController.js`
   - **Replacement**: Use `chatController.js` functions for chat functionality
   - **Status**: Maintained for backward compatibility only

### 🔄 **Legacy AI Utilities (Still Used in Fallback Mode)**

1. **`summarizeJournalEntry`** - Used in legacy fallback when `LLM_ENGINE !== 'langgraph'`
2. **`embedTextWithCohere`** - Used in legacy fallback for manual embedding generation
3. **`upsertToPinecone`** - Used in legacy fallback for manual vector storage
4. **`callLLM`** - Used in legacy fallback for direct LLM calls

### ⚠️ **Legacy Processing Paths**

1. **AI Processing in `createEntry`**
   - **Reason**: Manual AI pipeline replaced by LangGraph workflow
   - **Replacement**: LangGraph automatically handles all AI processing
   - **Status**: Fallback path only when `LLM_ENGINE !== 'langgraph'`
   - **Legacy Dependencies**: Still imports and uses `summarize.js`, `cohere.js`, `pinecone.js`

2. **AI Processing in `updateEntry`**
   - **Reason**: Manual AI reprocessing replaced by LangGraph workflow
   - **Replacement**: LangGraph automatically handles all AI reprocessing
   - **Status**: Fallback path only when `LLM_ENGINE !== 'langgraph'`
   - **Legacy Dependencies**: Still imports and uses `summarize.js`, `cohere.js`, `pinecone.js`

---

## Migration Status

### ✅ **Completed**
- LangGraph integration in primary AI functions (`createEntry`, `updateEntry`)
- Automatic engine switching based on environment
- Enhanced AI processing pipeline with structured workflows
- Improved error handling and validation

### ⚠️ **Legacy Support**
- Fallback paths maintained for backward compatibility
- Legacy AI utilities still functional but deprecated
- Manual AI processing preserved for non-LangGraph scenarios

### 🚀 **Benefits of LangGraph Migration**
- **Enhanced AI Processing**: Structured workflow with validation
- **Better Error Handling**: Robust JSON parsing and validation
- **Improved Consistency**: Unified AI processing across entry operations
- **Scalability**: Easier to extend and modify AI behavior
- **Maintainability**: Centralized AI logic in graph nodes

---

## Development Notes

### Environment Configuration
```bash
LLM_ENGINE=langgraph  # Enable LangGraph (recommended)
LLM_ENGINE=legacy     # Use legacy system (deprecated)
```

### Testing LangGraph
- Set `LLM_ENGINE=langgraph` in environment
- All AI processing automatically uses LangGraph workflow
- Monitor LangGraph node execution and state transitions

### Critical Issues to Address
1. **Pinecone Cleanup**: Implement vector deletion in `deleteEntry`
2. **Data Consistency**: Ensure MongoDB and Pinecone stay synchronized
3. **Error Handling**: Improve LangGraph error handling and fallbacks

### Future Enhancements
- Remove legacy AI utility dependencies
- Consolidate AI processing to LangGraph-only
- Add advanced LangGraph features (branching, conditional flows)
- Implement AI processing analytics and monitoring
- Add batch processing capabilities for multiple entries 