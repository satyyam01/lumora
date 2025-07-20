// server/ai/summarize.js
const { callLLM } = require('./llm'); // You will implement this API wrapper

// Helper to robustly extract JSON from LLM output
function extractJSON(text) {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const jsonString = text.substring(first, last + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Failed to parse JSON from LLM output');
    }
  }
  throw new Error('No JSON object found in LLM output');
}

async function summarizeJournalEntry(text) {
  const prompt = `
You are Lumora, an intelligent journaling assistant that helps users reflect on their experiences.

Your task is to deeply analyze a user's full journal entry and extract structured insights in the following JSON format:

{
  "summary": "...",              // 1 powerful sentence that captures the *main experience*, realization, or emotional core. Be specific.
  "bullets": ["...", "..."],     // 3–7 short, meaningful bullet points capturing *key facts*, *emotional shifts*, *patterns*, or *decisions*. Use a JSON array of strings.
  "mood": "...",                 // 1-word dominant *emotional state* (e.g., anxious, hopeful, grateful, numb)
  "tags": ["...", "..."],        // 2–3 *topics* or *themes* in lowercase (e.g., "relationship", "career", "growth"). No hashtags.
  "sentiment": "...",            // Choose from: positive, negative, neutral, anxious, frustrated, hopeful, grateful, joyful, sad, overwhelmed, peaceful.
  "intent": "..."                // Choose from: reflection, venting, planning, realization, processing, decision-making, gratitude
}

❗Avoid vague words like “things” or “stuff.”
❗Don't repeat content between fields.
✅ Be emotionally nuanced and fact-rich.

Now analyze this entry:

"${text}"

Respond with only a valid JSON object. All keys and string values must be double-quoted. 
Do not include markdown, triple backticks, or any explanation.`;
  const response = await callLLM(prompt);
  console.log('LLM raw response:', response); // Log the raw LLM output for debugging
  return extractJSON(response);
}


async function summarizeChatSession(messages) {
  const chatText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');

  const prompt = `
You are Lumora, an AI assistant reflecting on a past conversation between a user and you.

Your task is to extract a clean, structured summary in the following JSON format:

{
  "summary": "...",              // 1-line core summary: What was this session *mostly about*? Focus on key insight, topic, or emotional shift.
  "insights": ["...", "..."],    // 2–3 important takeaways or realizations expressed by the user.
  "tags": ["...", "..."]         // 2–3 relevant *emotions* or *topics* mentioned. Lowercase only. No hashtags.
}

Be emotionally aware, specific, and thoughtful.

Here is the session:
${chatText}

Respond in JSON only.`;

  const response = await callLLM(prompt);
  return JSON.parse(response);
}

module.exports = { summarizeJournalEntry, summarizeChatSession };