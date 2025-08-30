# LangGraph Summarization System

## Overview

The summarization system now handles both journal entries and chat messages with conditional processing based on content type.

## SummarizeGraph

### Purpose
A generic post-message processor that handles two types of content:
- **Journal entries**: Full summarization pipeline
- **Chat messages**: Important information classification and extraction

### Input Parameters
- `type`: "journal" or "chat"
- `content`: The text content to process
- `userId`: User identifier
- `entryId`: (Only for journal type) Journal entry ID
- `title`: (Only for journal type) Journal entry title

### Flow

#### Journal Type (`type: "journal"`)
1. **summarizeJournal**: Full analysis including summary, mood, tags, sentiment, intent, and bullets
2. **embedBullets**: Embed bullet points using Cohere
3. **upsertPinecone**: Store in Pinecone with full metadata
4. **persistJournalSummary**: Update journal entry in database

#### Chat Type (`type: "chat"`)
1. **classifyChatImportance**: Determine if message contains important information
2. **generateChatBullets**: (Only if important) Extract key bullet points
3. **embedBullets**: Embed bullet points using Cohere
4. **upsertPinecone**: Store in Pinecone with chat-specific metadata

### Conditional Processing
- **Journal**: Always runs full pipeline
- **Chat**: 
  - If "not important" → ends immediately
  - If "important" → generates bullets and stores

### Metadata Structure

#### Journal Metadata
```json
{
  "entryId": "string",
  "userId": "string", 
  "date": "ISO string",
  "title": "string",
  "summary": "string",
  "bullets": ["string"],
  "tags": ["string"],
  "sentiment": "string",
  "intent": "string",
  "type": "journal"
}
```

#### Chat Metadata
```json
{
  "userId": "string",
  "date": "ISO string", 
  "content": "string",
  "bullets": ["string"],
  "importance": "string",
  "type": "chat"
}
```

## Integration Points

### Journal Controller
- **createEntry**: Calls `summarizeGraph.invoke({ type: 'journal', ... })`
- **updateEntry**: Calls `summarizeGraph.invoke({ type: 'journal', ... })`

### Chat Controller
- **startChatSession**: Calls `summarizeGraph.invoke({ type: 'chat', ... })` (non-langgraph mode)
- **continueChatSession**: Calls `summarizeGraph.invoke({ type: 'chat', ... })` (non-langgraph mode)

### ChatGraph
- **summarizeChat node**: Automatically calls `summarizeGraph.invoke({ type: 'chat', ... })` after generating reply

## Async Processing

All summarization calls are asynchronous and non-blocking:
- Journal summarization runs after entry creation/update
- Chat summarization runs after message processing
- Errors are logged but don't block user responses

## Testing

Run the test script to verify functionality:
```bash
node scripts/test-summarize-graph.js
```

## Environment Variables Required

- `GROQ_API_KEY`: For LLM processing
- `GROQ_BASE_URL`: Groq API base URL
- `COHERE_API_KEY`: For text embeddings
- `PINECONE_API_KEY`: For vector storage
- `PINECONE_HOST`: Pinecone index host URL 