# Legacy AI modules

This folder contains the pre-LangGraph AI integration (direct Cohere, Pinecone REST, and Groq wrappers).

Controllers can switch between legacy and LangGraph via the `LLM_ENGINE` env flag.

- legacy modules are kept for rollback and parity testing. 