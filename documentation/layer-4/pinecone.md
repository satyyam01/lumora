# Pinecone Vector Database Integration Documentation

The `pinecone.js` file provides integration with Pinecone's vector database service for storing and querying high-dimensional vector embeddings. It enables semantic search capabilities across journal entries by storing AI-generated embeddings and metadata for efficient similarity-based retrieval.

## Functions

### upsertToPinecone

**Function Overview**
- Stores or updates vector embeddings in Pinecone vector database
- Handles both insert and update operations for existing vectors
- Stores metadata alongside vectors for context and filtering
- Supports custom namespaces for data organization
- Provides error handling and logging for API failures
- Critical for maintaining vector database consistency

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `{ id, embedding, metadata, namespace? }`
- **Returns**: Promise<Object> - Pinecone API response data

**Dependencies**
- **Models**: None
- **Utilities**: `axios` for HTTP requests to Pinecone API
- **Services**: Pinecone Vector Database (external service)
- **Other Controllers**: Used by `journalController.js` for storing entry embeddings

**Bugs or Development Challenges**
- Requires `PINECONE_API_KEY` and `PINECONE_HOST` environment variables
- API rate limiting and error handling
- Network dependency on external Pinecone service
- Vector storage costs scale with embedding dimensions (1024D)
- Critical for semantic search functionality across the application

---

### queryPinecone

**Function Overview**
- Performs similarity search in Pinecone vector database
- Finds top K most similar vectors to a given query embedding
- Returns matches with metadata and similarity scores
- Supports custom namespace filtering
- Enables semantic search across journal entries
- Provides context for AI-powered chat and analysis

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `{ embedding, topK?, namespace? }`
- **Returns**: Promise<Array> - Array of matches with metadata and scores

**Dependencies**
- **Models**: None
- **Utilities**: `axios` for HTTP requests to Pinecone API
- **Services**: Pinecone Vector Database (external service)
- **Other Controllers**: Used by `journalController.js` and `chatController.js` for semantic search

**Bugs or Development Challenges**
- Requires `PINECONE_API_KEY` and `PINECONE_HOST` environment variables
- Search quality depends on embedding quality from Cohere
- TopK parameter affects response time and relevance
- Metadata inclusion increases response payload size
- Critical for AI chat context and journal entry retrieval

---

### deleteUserVectorsFromPinecone

**Function Overview**
- Removes all vector embeddings for a specific user from Pinecone
- Uses metadata filtering to identify user-specific vectors
- Supports custom namespace deletion
- Critical for data cleanup when users delete accounts
- Ensures vector database consistency with user data
- Handles deletion errors gracefully

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `userId, namespace?`
- **Returns**: Promise<Object> - Pinecone deletion response data

**Dependencies**
- **Models**: None
- **Utilities**: `axios` for HTTP requests to Pinecone API
- **Services**: Pinecone Vector Database (external service)
- **Other Controllers**: Used by `authController.js` for account deletion cleanup

**Bugs or Development Challenges**
- Requires `PINECONE_API_KEY` and `PINECONE_HOST` environment variables
- Metadata filtering depends on consistent userId storage
- Deletion operations are irreversible
- Critical for GDPR compliance and data privacy
- Error handling prevents account deletion from failing 