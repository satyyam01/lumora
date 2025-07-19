const axios = require('axios');

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const COHERE_API_URL = 'https://api.cohere.ai/v1/embed';

/**
 * Generate an embedding for the given text using Cohere's API (embed-english-v3.0, 1024-dim).
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector (1024-dim).
 */
async function embedTextWithCohere(text) {
  try {
    const response = await axios.post(
      COHERE_API_URL,
      {
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.embeddings[0];
  } catch (err) {
    console.error('Cohere embedding error:', err.response?.data || err.message);
    throw new Error('Cohere embedding API call failed');
  }
}

module.exports = { embedTextWithCohere }; 