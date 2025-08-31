const axios = require('axios');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

/**
 * Delete all vectors for a user from Pinecone by userId (using metadata filter)
 * @param {string} userId - The user ID to delete vectors for
 * @param {string} [namespace='default'] - The Pinecone namespace
 * @returns {Promise<Object>} Pinecone deletion response data
 */
async function deleteUserVectorsFromPinecone(userId, namespace = 'default') {
  try {
    const response = await axios.post(
      `${PINECONE_HOST}/vectors/delete`,
      {
        filter: { userId },
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
    console.error('Pinecone delete error:', err.response?.data || err.message);
    throw new Error('Pinecone delete API call failed');
  }
}

/**
 * Delete a specific vector from Pinecone by entry ID
 * @param {string} entryId - The journal entry ID to delete vector for
 * @param {string} [namespace='default'] - The Pinecone namespace
 * @returns {Promise<Object>} Pinecone deletion response data
 */
async function deleteVectorByEntryId(entryId, namespace = 'default') {
  try {
    const response = await axios.post(
      `${PINECONE_HOST}/vectors/delete`,
      {
        ids: [entryId],
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
    console.error('Pinecone delete error:', err.response?.data || err.message);
    throw new Error('Pinecone delete API call failed');
  }
}

module.exports = { deleteUserVectorsFromPinecone, deleteVectorByEntryId }; 