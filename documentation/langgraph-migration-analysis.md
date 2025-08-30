# Lumora LangGraph Migration Analysis

## Overview
This document traces the migration of Lumora's journaling assistant from a direct API-based AI system to a LangGraph-based workflow system. The migration introduces structured, stateful AI workflows while maintaining backward compatibility through environment variable configuration.

## Migration Control
The system uses the `LLM_ENGINE` environment variable to switch between:
- **Legacy mode**: `LLM_ENGINE !== 'langgraph'` (default)
- **LangGraph mode**: `LLM_ENGINE === 'langgraph'`

## Old Flow (Pre-LangGraph)

### Chat Functionality
**Files responsible:**
- `server/ai/llm.js` - Direct Groq API calls for chat
- `server/ai/cohere.js` - Text embedding via Cohere
- `server/ai/pinecone.js` - Vector storage and retrieval
- `server/controllers/chatController.js` - Chat logic and context assembly

**Flow:**
1. User sends message to `/api/chat/session` or `/api/chat/chat`
2. Controller calls `embedTextWithCohere()` to embed user message
3. Controller calls `queryPinecone()` to retrieve relevant journal entries
4. Controller manually assembles context from Pinecone results
5. Controller calls `callChat()` with assembled prompt
6. Direct Groq API call returns response
7. Response saved to database

**Key functions:**
- `callChat(prompt)` - Single LLM call with pre-assembled context
- `embedTextWithCohere(text)` - Direct Cohere embedding
- `queryPinecone({embedding, topK})` - Direct Pinecone query

### Summarization Functionality
**Files responsible:**
- `server/ai/summarize.js` - Journal entry summarization logic
- `server/ai/llm.js` - LLM calls for summarization
- `server/controllers/journalController.js` - Entry creation/update logic

**Flow:**
1. User creates/updates journal entry
2. Controller calls `summarizeJournalEntry(content)`
3. `summarize.js` builds prompt and calls `callLLM(prompt)`
4. Direct Groq API call returns JSON summary
5. Controller manually extracts and saves summary data
6. Controller manually calls `embedTextWithCohere()` for bullets
7. Controller manually calls `upsertToPinecone()` to store vectors

**Key functions:**
- `summarizeJournalEntry(text)` - Builds prompt and calls LLM
- `callLLM(prompt)` - Direct LLM call for summarization
- Manual embedding and Pinecone storage in controller

## New Flow (LangGraph)

### Chat Functionality
**Files responsible:**
- `server/langgraph/chatGraph.js` - Structured chat workflow
- `server/controllers/chatController.js` - LangGraph integration

**Flow:**
1. User sends message to chat endpoint
2. Controller checks `LLM_ENGINE === 'langgraph'`
3. Controller calls `chatGraph.invoke({userId, sessionId, entryId, query, messages})`
4. LangGraph executes workflow:
   - `loadContext` - Loads entry-specific or global context
   - `embedQuery` - Embeds user query (skip if entry-specific)
   - `retrieveDocs` - Queries Pinecone for relevant entries (skip if entry-specific)
   - `assembleContext` - Assembles context from matches or entry
   - `generate` - Generates AI response with structured context
5. Response returned with `result.answer`
6. Controller saves to database

**Key functions:**
- `chatGraph.invoke(input)` - Executes complete chat workflow
- Stateful workflow with conditional execution paths
- Automatic context assembly and retrieval

### Summarization Functionality
**Files responsible:**
- `server/langgraph/summarizeGraph.js` - Structured summarization workflow
- `server/controllers/journalController.js` - LangGraph integration

**Flow:**
1. User creates/updates journal entry
2. Controller checks `LLM_ENGINE === 'langgraph'`
3. Controller calls `summarizeGraph.invoke({userId, entryId, title, content})`
4. LangGraph executes workflow:
   - `summarize` - Generates structured summary via LLM
   - `embedBullets` - Embeds bullet points for vector storage
   - `upsertPinecone` - Stores vectors in Pinecone
   - `persistSummary` - Saves summary to journal entry
5. Complete workflow executed atomically
6. Controller returns updated entry

**Key functions:**
- `summarizeGraph.invoke(input)` - Executes complete summarization workflow
- Structured data validation with Zod schemas
- Automatic vector storage and database updates

## Integration Points

### Controllers
**chatController.js:**
```javascript
// LangGraph integration
if (process.env.LLM_ENGINE === 'langgraph') {
  const result = await chatGraph.invoke({ 
    userId, 
    sessionId: null, 
    entryId: entryId || null, 
    query: message, 
    messages: [] 
  });
  // Use result.answer
}

// Legacy fallback
const aiResponse = await callChat(prompt);
```

**journalController.js:**
```javascript
// LangGraph integration
if (process.env.LLM_ENGINE === 'langgraph') {
  await summarizeGraph.invoke({ 
    userId: req.user.userId, 
    entryId: entry._id.toString(), 
    title: entry.title, 
    content: entry.content 
  });
  const refreshed = await JournalEntry.findById(entry._id);
  return res.status(201).json(refreshed);
}

// Legacy fallback
const summaryData = await summarizeJournalEntry(content);
// Manual embedding and storage...
```

### Routes
**chatRoutes.js:**
```javascript
const { chatGraph } = require('../langgraph/chatGraph');

// Test endpoint for LangGraph
router.post('/test/chat', async (req, res) => {
  const result = await chatGraph.invoke({ userId: req.user.userId, query: message });
  res.json({ answer: result.answer, matches: result.matches || [] });
});
```

**journalRoutes.js:**
```javascript
const { summarizeGraph } = require('../langgraph/summarizeGraph');

// Test endpoint for LangGraph
router.post('/test/summarize', async (req, res) => {
  const result = await summarizeGraph.invoke({ userId: req.user.userId, entryId, title, content });
  res.json({ ok: true, summaryData: result.summaryData });
});
```

## Leftover Unused Files

### Old AI System (Legacy)
These files are still imported and used when `LLM_ENGINE !== 'langgraph'`:

**Core AI modules:**
- `server/ai/llm.js` - Direct Groq API wrapper
- `server/ai/summarize.js` - Journal summarization logic
- `server/ai/cohere.js` - Cohere embedding wrapper
- `server/ai/pinecone.js` - Pinecone vector operations

**Legacy index:**
- `server/aiLegacy/index.js` - Legacy module exports
- `server/aiLegacy/README.md` - Migration documentation

### Still Used in Both Systems
- `server/ai/cohere.js` - Used by authController for user deletion cleanup
- `server/ai/pinecone.js` - Used by authController for user deletion cleanup

## Before vs After Flow Summary

### Chat Flow
```
OLD (Legacy):
User Message → Embed → Pinecone Query → Manual Context Assembly → LLM Call → Response

NEW (LangGraph):
User Message → LangGraph Workflow → Automatic Context Assembly → LLM Call → Response
```

### Summarization Flow
```
OLD (Legacy):
Entry Content → Manual Prompt → LLM Call → Manual JSON Parse → Manual Embedding → Manual Storage

NEW (LangGraph):
Entry Content → LangGraph Workflow → Structured LLM → Auto Validation → Auto Embedding → Auto Storage
```

## Benefits of Migration

1. **Structured Workflows**: LangGraph provides clear, testable workflow steps
2. **State Management**: Built-in state channels and conditional execution
3. **Error Handling**: Better error handling and retry logic
4. **Monitoring**: Built-in tracing and metadata for debugging
5. **Maintainability**: Clear separation of concerns and workflow logic
6. **Scalability**: Easier to add new workflow steps and modify existing ones

## Rollback Strategy

To rollback to the legacy system:
1. Set `LLM_ENGINE` to any value other than `'langgraph'`
2. Restart the server
3. All endpoints will automatically use the legacy AI modules

## Testing

Both systems include test endpoints:
- **LangGraph Chat**: `POST /api/chat/test/chat`
- **LangGraph Summarize**: `POST /api/journal/test/summarize`

These allow testing the new system without affecting production data.

## Future Considerations

1. **Complete Migration**: Consider removing legacy code once LangGraph is stable
2. **Performance Monitoring**: Compare response times between systems
3. **Feature Parity**: Ensure all legacy features are implemented in LangGraph
4. **Error Handling**: Implement comprehensive error handling in LangGraph workflows 