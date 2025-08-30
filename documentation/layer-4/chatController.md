# Chat Controller Documentation

The `chatController.js` file manages AI-powered chat functionality with journal entries, including session management, context-aware conversations, and semantic search integration. It provides both entry-specific and global chat capabilities using vector embeddings and LLM responses.

## Functions

### startChatSession

**Function Overview**
- Creates a new chat session with AI-powered responses
- Supports both entry-specific and global chat modes
- Generates vector embeddings for semantic search when no specific entry is provided
- Queries Pinecone for relevant journal entries as context
- Builds optimized prompts for the LLM with journal context
- Creates and stores chat sessions with conversation history
- Returns session ID, messages, and AI response

**API Details**
- **Endpoint**: `POST /api/chat/session`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message, entryId? }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `JournalEntry` for entry-specific chat, `ChatSession` for session storage
- **Utilities**: `cohere.js` for embeddings, `pinecone.js` for vector search, `llm.js` for AI responses
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Complex AI pipeline integration
- Vector search relevance depends on embedding quality
- Session title generation from message content
- Error handling for AI service failures

---

### continueChatSession

**Function Overview**
- Continues an existing chat session with additional messages
- Maintains conversation context using recent message history
- Filters and validates messages for LLM processing
- Builds system and user messages for context-aware responses
- Saves both user and AI messages to the session
- Handles message filtering to prevent invalid inputs

**API Details**
- **Endpoint**: `POST /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message }`
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession` for session retrieval and updates
- **Utilities**: `llm.js` for AI responses
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- Message filtering and validation for LLM safety
- Context window management (last 6 messages)
- Role mapping between internal and LLM formats
- Error handling for session continuation

---

### listChatSessions

**Function Overview**
- Retrieves all chat sessions for the authenticated user
- Populates entry information for entry-specific sessions
- Sorts sessions by creation date (newest first)
- Returns session metadata without full message content
- Includes session status and summary information

**API Details**
- **Endpoint**: `GET /api/chat/sessions`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession` for session listing with entry population
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard database query with user isolation
- Efficient data selection (excludes message content)

---

### getChatSession

**Function Overview**
- Retrieves a single chat session by ID
- Ensures the session belongs to the authenticated user
- Populates entry information for context
- Returns complete session data including all messages
- Provides 404 error for non-existent or unauthorized sessions

**API Details**
- **Endpoint**: `GET /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession` for session retrieval with entry population
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard user isolation and error handling
- Entry population for context information

---

### deleteChatSession

**Function Overview**
- Deletes a chat session by ID
- Ensures the session belongs to the authenticated user
- Permanently removes the session and all associated messages
- Returns success confirmation upon deletion
- Provides 404 error for non-existent or unauthorized sessions

**API Details**
- **Endpoint**: `DELETE /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession` for session deletion
- **Utilities**: None
- **Services**: None
- **Other Controllers**: None

**Bugs or Development Challenges**
- No specific bugs noted in the code
- Standard user isolation and error handling
- Permanent deletion of session data

---

### chatWithJournal

**Function Overview**
- Provides AI-powered chat functionality with journal context
- Generates embeddings for user messages using Cohere
- Queries Pinecone for top 5 relevant journal entries
- Formats context from journal summaries and bullet points
- Builds prompts for empathetic journaling assistance
- Returns AI-generated responses based on journal history
- Enables conversational journal analysis without session persistence

**API Details**
- **Endpoint**: `POST /api/chat/journal`
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
- No session persistence (stateless chat) 