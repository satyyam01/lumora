# LangGraph Migration: File Impact Analysis

## Overview
This document analyzes the impact of the LangGraph migration on each file documented in the Lumora project. It categorizes files based on whether they remain unchanged (Legacy), have been modified (Legacy with tweaks), or have been replaced/deprecated by the new LangGraph system.

## File Categorization

### 🔄 **Legacy with Tweaks** - Modified but Still Used

#### **server/controllers/chatController.js**
**Original Flow (Documented):**
- Direct calls to `embedTextWithCohere()`, `queryPinecone()`, `callChat()`
- Manual context assembly from Pinecone results
- Single LLM call with pre-assembled prompt

**Changes Made:**
- **New Import**: `const { chatGraph } = require('../langgraph/chatGraph');`
- **Conditional Logic**: Added `if (process.env.LLM_ENGINE === 'langgraph')` checks in:
  - `startChatSession()` - Lines 17-32
  - `continueChatSession()` - Lines 131-142  
  - `chatWithJournal()` - Lines 247-252
- **LangGraph Integration**: Replaced manual AI pipeline with `chatGraph.invoke()`
- **Response Handling**: Changed from `aiResponse` to `result.answer`

**Integration Points:**
- **Routes**: No changes to route definitions
- **Middleware**: No changes to authentication or validation
- **Models**: No changes to ChatSession or JournalEntry usage

#### **server/controllers/journalController.js**
**Original Flow (Documented):**
- Direct calls to `summarizeJournalEntry()`, `embedTextWithCohere()`, `upsertToPinecone()`
- Manual JSON parsing and data extraction
- Sequential AI processing steps

**Changes Made:**
- **New Import**: `const { summarizeGraph } = require('../langgraph/summarizeGraph');`
- **Conditional Logic**: Added `if (process.env.LLM_ENGINE === 'langgraph')` checks in:
  - `createEntry()` - Lines 95-100
  - `updateEntry()` - Lines 183-188
- **LangGraph Integration**: Replaced manual summarization with `summarizeGraph.invoke()`
- **Response Handling**: Changed from manual summary data to refreshed entry from database

**Integration Points:**
- **Routes**: No changes to route definitions
- **Middleware**: No changes to authentication or validation
- **Models**: No changes to JournalEntry or User usage

#### **server/routes/chatRoutes.js**
**Original Flow (Documented):**
- Standard Express route definitions
- Controller function calls

**Changes Made:**
- **New Import**: `const { chatGraph } = require('../langgraph/chatGraph');`
- **New Test Endpoint**: Added `POST /api/chat/test/chat` for LangGraph testing
- **LangGraph Testing**: Direct `chatGraph.invoke()` call in test route

**Integration Points:**
- **Middleware**: No changes to authentication middleware
- **Controllers**: No changes to controller function calls

#### **server/routes/journalRoutes.js**
**Original Flow (Documented):**
- Standard Express route definitions
- Controller function calls

**Changes Made:**
- **New Import**: `const { summarizeGraph } = require('../langgraph/summarizeGraph');`
- **New Test Endpoint**: Added `POST /api/journal/test/summarize` for LangGraph testing
- **LangGraph Testing**: Direct `summarizeGraph.invoke()` call in test route

**Integration Points:**
- **Middleware**: No changes to authentication middleware
- **Controllers**: No changes to controller function calls

### ✅ **Legacy (Unchanged)** - Still Used Exactly as Documented

#### **server/controllers/authController.js**
**Status**: No changes from documented flow
**Reason**: Not involved in AI/chat functionality
**Usage**: Still handles user authentication, profile management, and account deletion
**Dependencies**: Still uses `server/ai/pinecone.js` for user vector cleanup

#### **server/controllers/goalController.js**
**Status**: No changes from documented flow
**Reason**: Not involved in AI/chat functionality
**Usage**: Still manages journaling goals, progress tracking, and reminders
**Dependencies**: No AI service dependencies

#### **server/ai/cohere.js**
**Status**: **DEPRECATED** when `LLM_ENGINE === 'langgraph'`
**Reason**: Replaced by LangChain's `CohereEmbeddings` wrapper in LangGraph workflows
**Usage**: 
- Legacy mode: Direct usage in controllers via `embedTextWithCohere()`
- LangGraph mode: **BYPASSED** - uses `CohereEmbeddings` from `@langchain/cohere` package
**Dependencies**: No longer imported or used in LangGraph mode

#### **server/ai/pinecone.js**
**Status**: **DEPRECATED** when `LLM_ENGINE === 'langgraph'`
**Reason**: Replaced by custom HTTP implementations in LangGraph workflows
**Usage**:
- Legacy mode: Direct usage in controllers via `upsertToPinecone()` and `queryPinecone()`
- LangGraph mode: **BYPASSED** - uses custom `pineconeUpsert()` and `pineconeQuery()` functions
**Dependencies**: No longer imported or used in LangGraph mode

#### **server/services/reminderService.js**
**Status**: No changes from documented flow
**Reason**: Not involved in AI/chat functionality
**Usage**: Still manages automated email reminders for journaling goals
**Dependencies**: No AI service dependencies

#### **server/utils/emailService.js**
**Status**: No changes from documented flow
**Reason**: Not involved in AI/chat functionality
**Usage**: Still handles email delivery for OTP verification and reminders
**Dependencies**: No AI service dependencies

### 🚫 **Replaced/Deprecated** - Functionality Taken Over by LangGraph

#### **server/ai/llm.js**
**Original Purpose**: Direct Groq API integration for LLM calls
**Status**: **DEPRECATED** when `LLM_ENGINE === 'langgraph'`
**Replacement**: `server/langgraph/chatGraph.js` and `server/langgraph/summarizeGraph.js`
**Current Usage**: 
- Legacy mode: Still used for direct LLM calls
- LangGraph mode: Bypassed entirely
**Integration Changes**: Controllers now call LangGraph workflows instead of direct LLM functions

#### **server/ai/summarize.js**
**Original Purpose**: Journal entry summarization and analysis
**Status**: **DEPRECATED** when `LLM_ENGINE === 'langgraph'`
**Replacement**: `server/langgraph/summarizeGraph.js`
**Current Usage**:
- Legacy mode: Still used for manual summarization pipeline
- LangGraph mode: Bypassed entirely
**Integration Changes**: Controllers now call `summarizeGraph.invoke()` instead of `summarizeJournalEntry()`

#### **server/aiLegacy/index.js**
**Original Purpose**: Legacy AI module exports
**Status**: **DEPRECATED** - Only kept for rollback purposes
**Replacement**: Direct imports of individual AI modules or LangGraph workflows
**Current Usage**: Not imported anywhere in the current codebase
**Integration Changes**: No active integration

#### **server/aiLegacy/README.md**
**Original Purpose**: Documentation of legacy AI system
**Status**: **DEPRECATED** - Migration documentation only
**Replacement**: `documentation/langgraph-migration-analysis.md`
**Current Usage**: Reference only for rollback procedures

## Integration Changes Summary

### New Imports Added
```javascript
// In chatController.js
const { chatGraph } = require('../langgraph/chatGraph');

// In journalController.js  
const { summarizeGraph } = require('../langgraph/summarizeGraph');

// In chatRoutes.js
const { chatGraph } = require('../langgraph/chatGraph');

// In journalRoutes.js
const { summarizeGraph } = require('../langgraph/summarizeGraph');
```

### Function Call Changes
```javascript
// OLD (Legacy)
const aiResponse = await callChat(prompt);
const summaryData = await summarizeJournalEntry(content);

// NEW (LangGraph)
const result = await chatGraph.invoke({ userId, sessionId, entryId, query, message });
await summarizeGraph.invoke({ userId, entryId, title, content });
```

### New Test Endpoints
```javascript
// Chat testing
router.post('/test/chat', async (req, res) => {
  const result = await chatGraph.invoke({ userId: req.user.userId, query: message });
  res.json({ answer: result.answer, matches: result.matches || [] });
});

// Summarization testing
router.post('/test/summarize', async (req, res) => {
  const result = await summarizeGraph.invoke({ userId: req.user.userId, entryId, title, content });
  res.json({ ok: true, summaryData: result.summaryData });
});
```

## Before vs After Flow Table

| Component | Before (Legacy) | After (LangGraph) | Status |
|-----------|----------------|-------------------|---------|
| **Chat Flow** | Manual embedding → Pinecone query → Context assembly → LLM call | LangGraph workflow with automatic context assembly | 🔄 Modified |
| **Summarization Flow** | Manual prompt → LLM call → JSON parse → Manual embedding → Manual storage | LangGraph workflow with structured validation and automatic storage | 🔄 Modified |
| **AI Service Integration** | Direct API calls to individual services | Orchestrated workflows with state management | 🔄 Modified |
| **Error Handling** | Manual error handling in controllers | Built-in LangGraph error handling and retry logic | 🔄 Modified |
| **Context Assembly** | Manual formatting in controllers | Automatic context assembly in LangGraph nodes | 🔄 Modified |
| **Vector Operations** | Manual embedding and storage calls via utility functions | Direct API calls via LangChain wrappers and custom HTTP functions | 🔄 Modified |
| **Authentication** | No changes | No changes | ✅ Unchanged |
| **Goal Management** | No changes | No changes | ✅ Unchanged |
| **Email Services** | No changes | No changes | ✅ Unchanged |
| **Reminder System** | No changes | No changes | ✅ Unchanged |

## Key Architectural Changes

### 1. **Service Orchestration**
- **Before**: Controllers manually orchestrated AI service calls
- **After**: LangGraph workflows handle service orchestration automatically

### 2. **State Management**
- **Before**: No persistent state between AI operations
- **After**: LangGraph provides stateful workflow execution with memory

### 3. **Error Handling**
- **Before**: Manual error handling in each controller
- **After**: Built-in LangGraph error handling and retry mechanisms

### 4. **Context Assembly**
- **Before**: Manual context formatting in controllers
- **After**: Automatic context assembly in dedicated LangGraph nodes

### 5. **Data Validation**
- **Before**: Manual JSON parsing and validation
- **After**: Structured validation with Zod schemas in LangGraph

### 6. **API Integration**
- **Before**: Used utility functions (`cohere.js`, `pinecone.js`, `llm.js`)
- **After**: Direct API calls via LangChain wrappers (`CohereEmbeddings`) and custom HTTP functions (`pineconeUpsert`, `pineconeQuery`)

## Rollback Capability

The system maintains full backward compatibility through the `LLM_ENGINE` environment variable:

- **`LLM_ENGINE === 'langgraph'`**: Uses new LangGraph workflows
- **`LLM_ENGINE !== 'langgraph'`**: Falls back to legacy AI modules

This allows for seamless rollback if issues arise with the new LangGraph system.

## Future Considerations

1. **Complete Migration**: Once LangGraph is stable, consider removing legacy AI modules
2. **Performance Monitoring**: Compare response times between legacy and LangGraph systems
3. **Feature Parity**: Ensure all legacy features are fully implemented in LangGraph
4. **Error Handling**: Implement comprehensive error handling in LangGraph workflows
5. **Testing**: Expand test coverage for LangGraph workflows 