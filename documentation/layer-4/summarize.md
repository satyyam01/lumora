# AI Summarization Service Documentation

The `summarize.js` file provides AI-powered text analysis and summarization services for journal entries and chat sessions. It uses LLM integration to extract structured insights, emotional analysis, and key takeaways from user content, enabling intelligent journaling features and conversation summarization.

## Functions

### extractJSON (Helper Function)

**Function Overview**
- Robustly extracts JSON objects from LLM text responses
- Handles malformed or incomplete JSON output gracefully
- Finds first and last curly braces to isolate JSON content
- Provides detailed error messages for debugging
- Critical for parsing structured LLM responses
- Ensures data integrity for downstream processing

**API Details**
- **Endpoint**: N/A (internal helper function)
- **Access Control**: N/A (internal function)
- **Parameters**: `text` (string) - Raw LLM response text
- **Returns**: Object - Parsed JSON data or throws error

**Dependencies**
- **Models**: None
- **Utilities**: None
- **Services**: None
- **Other Controllers**: Used internally by summarization functions

**Bugs or Development Challenges**
- JSON parsing can fail with malformed LLM responses
- Error handling is critical for system stability
- LLM output format consistency is not guaranteed
- Critical for structured data extraction from AI responses

---

### summarizeJournalEntry

**Function Overview**
- Analyzes journal entries to extract structured insights and emotional data
- Generates comprehensive summaries with bullet points and metadata
- Identifies mood, sentiment, intent, and relevant tags
- Uses detailed prompts to ensure consistent output quality
- Extracts emotional patterns and key realizations
- Provides foundation for AI-powered journal analysis and search

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `text` (string) - Journal entry content to analyze
- **Returns**: Promise<Object> - Structured analysis with summary, bullets, mood, tags, sentiment, intent

**Dependencies**
- **Models**: None
- **Utilities**: `llm.js` for AI-powered analysis (`callLLM` function)
- **Services**: None
- **Other Controllers**: Used by `journalController.js` for entry analysis

**Bugs or Development Challenges**
- LLM response consistency and JSON parsing reliability
- Prompt engineering for consistent output format
- Error handling for malformed AI responses
- Critical for journal entry vectorization and search
- Debug logging for LLM raw responses

---

### summarizeChatSession

**Function Overview**
- Analyzes chat conversations to extract key insights and themes
- Generates structured summaries of user-AI interactions
- Identifies important takeaways and emotional patterns
- Uses conversation context for meaningful analysis
- Provides session overviews for future reference
- Enables intelligent chat history management

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `messages` (Array) - Array of chat messages with role and content
- **Returns**: Promise<Object> - Structured summary with summary, insights, and tags

**Dependencies**
- **Models**: None
- **Utilities**: `llm.js` for AI-powered analysis (`callLLM` function)
- **Services**: None
- **Other Controllers**: Used for chat session summarization

**Bugs or Development Challenges**
- Message format validation and role mapping
- Conversation context preservation for meaningful analysis
- LLM response parsing and error handling
- Critical for chat session management and insights 