const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Store your key in .env
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // Example endpoint

async function callLLM(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192', // Or your preferred Groq model
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // Return the assistant's reply (assuming OpenAI-compatible response)
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq LLM error:', err.response?.data || err.message);
    throw new Error('LLM API call failed');
  }
}

module.exports = { callLLM }; 