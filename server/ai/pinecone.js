const axios = require('axios');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

/**
 * Upsert a vector and metadata to Pinecone.
 * @param {Object} params
 * @param {string} params.id - The unique ID for the vector.
 * @param {number[]} params.embedding - The embedding vector.
 * @param {Object} params.metadata - Metadata to store with the vector.
 * @param {string} [params.namespace='default'] - Pinecone namespace.
 */
async function upsertToPinecone({ id, embedding, metadata, namespace = 'default' }) {
  try {
    const response = await axios.post(
      `${PINECONE_HOST}/vectors/upsert`,
      {
        vectors: [
          {
            id,
            values: embedding,
            metadata,
          },
        ],
        namespace,
      },
      {
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('Pinecone upsert error:', err.response?.data || err.message);
    throw new Error('Pinecone upsert API call failed');
  }
}

/**
 * Query Pinecone for top K similar vectors.
 * @param {Object} params
 * @param {number[]} params.embedding - The embedding vector to search with.
 * @param {number} [params.topK=5] - Number of top results to return.
 * @param {string} [params.namespace='default'] - Pinecone namespace.
 * @returns {Promise<Array>} - Array of matches with metadata and scores.
 */
async function queryPinecone({ embedding, topK = 5, namespace = 'default' }) {
  try {
    const response = await axios.post(
      `${PINECONE_HOST}/query`,
      {
        vector: embedding,
        topK,
        includeMetadata: true,
        namespace,
      },
      {
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.matches;
  } catch (err) {
    console.error('Pinecone query error:', err.response?.data || err.message);
    throw new Error('Pinecone query API call failed');
  }
}

module.exports = { upsertToPinecone, queryPinecone }; 