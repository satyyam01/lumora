// server/ai/summarize.js
const { callLLM } = require('./llm'); // You will implement this API wrapper

async function summarizeJournalEntry(text) {
  const prompt = `
You are an AI journaling assistant helping summarize and label a user's journal session.

Given the full journal entry and all associated logs from today, generate:

summary: A single, powerful sentence that captures the core of the user’s experience today. Prioritize specific events, emotional turning points, decisions made, recurring patterns, or meaningful realizations. Avoid vague or generic statements like “had a mixed day” or “went through a lot”—be concrete, even if brief.

mood: The dominant mood in one word (e.g., overwhelmed, hopeful, anxious, energized).

tags: 2–3 concise tags (as lowercase strings in an array) derived from the key topics, people, or themes mentioned in the entry/logs (no hashtags).

sentiment: Choose from a limited list: positive, negative, neutral, anxious, frustrated, hopeful, grateful, joyful, sad, overwhelmed, peaceful.

intent: Choose from: reflection, venting, planning, realization, processing, decision-making, gratitude.

Example Output Format:
{
"summary": "Felt defeated after failing the mock interview but made a firm decision to restructure the prep plan starting tomorrow.",
"mood": "determined",
"tags": ["interview", "failure", "self-improvement"],
"sentiment": "hopeful",
"intent": "reflection"
}

Now evaluate the following journal entry and logs:

Entry and logs:
${text}

Respond in JSON only.`;
  const response = await callLLM(prompt);
  return JSON.parse(response);
}

async function summarizeChatSession(messages) {
  const chatText = messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
  const prompt = `
You are an AI reflection agent. Summarize the following chat session for key insights, decisions, and emotions. Provide:
- A 1-line summary
- 2-3 key insights (as an array)
- Tags (emotions, topics)

Chat session:
${chatText}

Respond in JSON:
{
  "summary": "...",
  "insights": ["...", "..."],
  "tags": ["...", "..."]
}
`;
  const response = await callLLM(prompt);
  return JSON.parse(response);
}

module.exports = {
  summarizeJournalEntry,
  summarizeChatSession,
}; 