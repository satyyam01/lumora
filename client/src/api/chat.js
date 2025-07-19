// Chat session API utilities

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchChatSessions() {
  const res = await fetch("/api/chat/sessions", {
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch chat sessions");
  return res.json();
}

export async function createChatSession(message) {
  const res = await fetch("/api/chat/session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to create chat session");
  return res.json();
}

export async function fetchSessionMessages(sessionId) {
  const res = await fetch(`/api/chat/session/${sessionId}`, {
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch session messages");
  return res.json();
}

export async function sendMessageToSession(sessionId, message) {
  const res = await fetch(`/api/chat/session/${sessionId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function deleteChatSession(sessionId) {
  const res = await fetch(`/api/chat/session/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) throw new Error("Failed to delete chat session");
  return res.json();
} 