# Chat Controller Documentation (LangGraph Migration)

The `chatController.js` file handles AI-powered chat functionality with journal context. With the migration to LangGraph, the chat system now uses a sophisticated graph-based workflow for enhanced context retrieval and response generation.

## Architecture Overview

**Primary Engine**: LangGraph-based chat system (`chatGraph.invoke`)
**Fallback Engine**: Legacy LLM system (when `LLM_ENGINE !== 'langgraph'`)
**Integration**: Seamlessly switches between engines based on environment configuration

## Functions

### startChatSession

**Function Overview**
- Creates new chat sessions with AI-powered responses
- Automatically routes to LangGraph when enabled
- Supports both entry-specific and global journal context
- Creates persistent chat sessions with message history

**API Details**
- **Endpoint**: `POST /api/chat/session`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message, entryId? }`
- **Request Headers**: `Authorization: Bearer <token>`

**LangGraph Flow** (Primary Path)
1. Routes to `chatGraph.invoke` with user context
2. Processes through LangGraph nodes: `loadContext` → `embedQuery` → `retrieveDocs` → `assembleContext` → `generate`
3. Returns AI response with session persistence

**Legacy Flow** (Fallback)
1. Manual embedding generation via Cohere
2. Pinecone vector search for relevant entries
3. Context assembly and LLM prompt building
4. Direct LLM call via `callChat`

**Dependencies**
- **Models**: `ChatSession`, `JournalEntry`
- **LangGraph**: `chatGraph.invoke` (primary)
- **Legacy AI**: `cohere.js`, `pinecone.js`, `llm.js` (fallback)

**Status**: ✅ **Active** - Primary chat entry point

---

### continueChatSession

**Function Overview**
- Continues existing chat sessions with conversation history
- Maintains context across multiple exchanges
- Automatically routes to LangGraph when enabled
- Updates session with new message exchanges

**API Details**
- **Endpoint**: `POST /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message }`
- **Request Headers**: `Authorization: Bearer <token>`

**LangGraph Flow** (Primary Path)
1. Extracts recent conversation history (last 6 messages)
2. Routes to `chatGraph.invoke` with full context
3. Processes through LangGraph workflow
4. Updates session with new messages

**Legacy Flow** (Fallback)
1. Manual conversation history management
2. Context filtering and message validation
3. Direct LLM call with conversation context

**Dependencies**
- **Models**: `ChatSession`
- **LangGraph**: `chatGraph.invoke` (primary)
- **Legacy AI**: `llm.js` (fallback)

**Status**: ✅ **Active** - Primary conversation continuation

---

### listChatSessions

**Function Overview**
- Retrieves all chat sessions for authenticated user
- Provides session metadata and entry associations
- No AI processing - pure data retrieval

**API Details**
- **Endpoint**: `GET /api/chat/sessions`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession`
- **AI Services**: None

**Status**: ✅ **Active** - Session management

---

### getChatSession

**Function Overview**
- Retrieves single chat session with full details
- Populates associated journal entry data
- No AI processing - pure data retrieval

**API Details**
- **Endpoint**: `GET /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession`, `JournalEntry`
- **AI Services**: None

**Status**: ✅ **Active** - Session retrieval

---

### deleteChatSession

**Function Overview**
- Deletes chat session and associated data
- Ensures user ownership validation
- No AI processing - pure data management

**API Details**
- **Endpoint**: `DELETE /api/chat/session/:id`
- **Access Control**: Authenticated users only
- **Request Headers**: `Authorization: Bearer <token>`

**Dependencies**
- **Models**: `ChatSession`
- **AI Services**: None

**Status**: ✅ **Active** - Session cleanup

---

### chatWithJournal

**Function Overview**
- **DEPRECATED** - Replaced by LangGraph-based chat system
- Legacy chatbot endpoint for direct journal queries
- Still functional but not recommended for new development

**API Details**
- **Endpoint**: `POST /api/journal/chat`
- **Access Control**: Authenticated users only
- **Request Body**: `{ message }`
- **Request Headers**: `Authorization: Bearer <token>`

**LangGraph Flow** (Primary Path)
1. Routes to `chatGraph.invoke` for enhanced processing
2. Returns structured response with context

**Legacy Flow** (Fallback)
1. Manual embedding and vector search
2. Context assembly and LLM prompting
3. Direct response generation

**Dependencies**
- **LangGraph**: `chatGraph.invoke` (primary)
- **Legacy AI**: `cohere.js`, `pinecone.js`, `llm.js` (fallback)

**Status**: ⚠️ **Deprecated** - Use `startChatSession` instead

---

## LangGraph Integration

### chatGraph.invoke

**Primary Chat Engine**
- **Location**: `server/langgraph/chatGraph.js`
- **Workflow**: StateGraph-based processing pipeline
- **Nodes**: `loadContext` → `embedQuery` → `retrieveDocs` → `assembleContext` → `generate`

**Key Features**
- Intelligent context loading (entry-specific vs. global)
- Semantic search via Cohere embeddings
- Pinecone vector retrieval
- Context-aware response generation
- Conversation memory management

**Input Parameters**
```javascript
{
  userId: 'string',
  sessionId: 'string|null',
  entryId: 'string|null',
  query: 'string',
  messages: 'array'
}
```

**Output Structure**
```javascript
{
  answer: 'string',
  context: 'string',
  matches: 'array',
  entryTitle: 'string'
}
```

---

## Redundant Functions (Post-LangGraph Migration)

### ❌ **DEPRECATED Functions**

1. **`chatWithJournal`**
   - **Reason**: Superseded by LangGraph-based `startChatSession`
   - **Replacement**: Use `startChatSession` with appropriate parameters
   - **Status**: Maintained for backward compatibility only

2. **Legacy AI Processing in `startChatSession`**
   - **Reason**: Manual embedding and context assembly replaced by LangGraph nodes
   - **Replacement**: LangGraph automatically handles all AI processing
   - **Status**: Fallback path only when `LLM_ENGINE !== 'langgraph'`

3. **Legacy AI Processing in `continueChatSession`**
   - **Reason**: Manual conversation management replaced by LangGraph state management
   - **Replacement**: LangGraph maintains conversation state and context
   - **Status**: Fallback path only when `LLM_ENGINE !== 'langgraph'`

### 🔄 **Legacy AI Utilities (Unused with LangGraph)**

1. **`embedTextWithCohere`** - Replaced by LangGraph `embedQuery` node
2. **`queryPinecone`** - Replaced by LangGraph `retrieveDocs` node  
3. **`callChat`** - Replaced by LangGraph `generate` node

---

## Migration Status

### ✅ **Completed**
- LangGraph integration in primary chat functions
- Automatic engine switching based on environment
- Enhanced context processing and response generation
- Conversation state management via LangGraph

### ⚠️ **Legacy Support**
- Fallback paths maintained for backward compatibility
- Legacy AI utilities still functional but deprecated
- Manual context assembly preserved for non-LangGraph scenarios

### 🚀 **Benefits of LangGraph Migration**
- **Enhanced Context**: Intelligent entry-specific vs. global context handling
- **Better Memory**: Conversation state management and history filtering
- **Improved Flow**: Structured processing pipeline with error handling
- **Scalability**: Easier to extend and modify chat behavior
- **Consistency**: Unified AI processing across all chat functions

---

## Development Notes

### Environment Configuration
```bash
LLM_ENGINE=langgraph  # Enable LangGraph (recommended)
LLM_ENGINE=legacy     # Use legacy system (deprecated)
```

### Testing LangGraph
- Set `LLM_ENGINE=langgraph` in environment
- All chat functions automatically use LangGraph workflow
- Monitor LangGraph node execution and state transitions

### Future Enhancements
- Remove legacy AI utility dependencies
- Consolidate chat endpoints to LangGraph-only
- Add advanced LangGraph features (memory, branching, etc.)
- Implement chat analytics and insights via LangGraph state 