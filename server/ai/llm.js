const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Store your key in .env
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'; // Example endpoint

// For summarization and other tasks (Mixtral)
async function callLLM(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are Lumora's intelligent summarization agent. 
Your job is to read a user's journal entry and return a clear, emotionally intelligent summary 
in bullet points, along with mood, intent, and any relevant tags.` },
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
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq LLM error:', err.response?.data || err.message);
    throw new Error('LLM API call failed');
  }
}

// For chat with journal (multi-turn or single-turn)
async function callChat(input) {
  try {
    let messages;
    if (typeof input === 'string') {
      // Single-turn: treat input as prompt
      messages = [
        { role: 'system', content: `You are Lumora, a mindful and empathetic journaling companion.
You help users reflect on their past thoughts, recognize patterns, and gently guide them through emotional self-discovery.
Always respond in a compassionate, conversational tone, and reference past journal context when available.
Avoid generic advice. Be personal, thoughtful, and reflective.

If the user seems confused, validate their experience. If they’re celebrating something, celebrate with them. If they’re sad, be comforting.

Don't rush to solutions. Help them explore their thoughts.` },
        { role: 'user', content: input }
      ];
    } else if (input && Array.isArray(input.messages)) {
      // Multi-turn: use provided messages array
      messages = input.messages;
    } else {
      throw new Error('Invalid input to callChat');
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages,
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
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq Chat error:', err.response?.data || err.message);
    throw new Error('Chat API call failed');
  }
}

module.exports = { callLLM, callChat }; 