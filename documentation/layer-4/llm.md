# LLM Integration Documentation

The `llm.js` file provides integration with Groq's LLM API for AI-powered text generation, summarization, and conversational responses. It uses the Llama 3.3 70B model for high-quality AI interactions and supports both single-turn and multi-turn conversation modes.

## Functions

### callLLM

**Function Overview**
- Generates AI-powered summaries and analysis using Groq's Llama 3.3 70B model
- Optimized for journal entry summarization and structured data extraction
- Uses system prompts to define the AI's role and behavior
- Configures temperature and token limits for consistent output quality
- Handles API authentication and error responses
- Critical for journal entry analysis and insight generation

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `prompt` (string) - The text prompt for the LLM
- **Returns**: Promise<string> - AI-generated response text

**Dependencies**
- **Models**: None
- **Utilities**: `axios` for HTTP requests to Groq API
- **Services**: Groq LLM API (external service)
- **Other Controllers**: Used by `summarize.js` for journal entry analysis

**Bugs or Development Challenges**
- Requires `GROQ_API_KEY` environment variable
- API rate limiting and error handling
- Network dependency on external Groq service
- Model performance depends on prompt quality and clarity
- Token limits (512) may truncate long responses
- Critical for AI-powered journal analysis functionality

---

### callChat

**Function Overview**
- Provides conversational AI capabilities for chat interactions
- Supports both single-turn (string input) and multi-turn (messages array) modes
- Uses empathetic system prompts for journaling assistance
- Configures higher token limits (1024) for conversational responses
- Maintains conversation context and personality consistency
- Enables AI-powered journal reflection and guidance

**API Details**
- **Endpoint**: N/A (internal utility function)
- **Access Control**: N/A (internal function)
- **Parameters**: `input` (string|Object) - Prompt string or messages array
- **Returns**: Promise<string> - AI-generated chat response

**Dependencies**
- **Models**: None
- **Utilities**: `axios` for HTTP requests to Groq API
- **Services**: Groq LLM API (external service)
- **Other Controllers**: Used by `chatController.js` for AI chat functionality

**Bugs or Development Challenges**
- Requires `GROQ_API_KEY` environment variable
- Input validation for different input types (string vs messages array)
- Message filtering and role mapping for LLM compatibility
- Conversation context management and memory
- API rate limiting and error handling
- Critical for AI chat and journal reflection features 