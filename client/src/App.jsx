import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { Button } from "./components/ui/button";
import AuthForm from "./components/AuthForm";
import { Input } from "./components/ui/input";
import ProtectedRoute from "./components/ProtectedRoute";

function useTodaysEntries() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/journals/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { data, loading, error };
}

function useTodaysEntriesWithRefetch() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const refetch = React.useCallback(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/journals/today", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  React.useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

function useTodayMood() {
  const [data, setData] = React.useState({ mood: null, sentiment: null });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/journals/stats/today-mood", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { data, loading, error };
}

function useWeeklySentimentTrend() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/api/journals/stats/weekly-sentiment", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  return { data, loading, error };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: undefined,
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Home() {
  const isLoggedIn = !!localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    if (isLoggedIn) {
      // Optionally, do not redirect, show dashboard instead
    }
  }, [isLoggedIn, navigate]);
  const { data: todaysEntries, loading: loadingToday, error: errorToday, refetch: refetchToday } = useTodaysEntriesWithRefetch();
  const todayEntry = todaysEntries[0];
  const [newLog, setNewLog] = React.useState("");
  const [addingLog, setAddingLog] = React.useState(false);
  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setAddingLog(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3000/api/journals/today/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newLog }),
      });
      setNewLog("");
      refetchToday();
    } catch (err) {
      // Optionally show error
    } finally {
      setAddingLog(false);
    }
  };
  const { data: todayMoodData, loading: loadingMood } = useTodayMood();
  const { data: sentimentTrend, loading: loadingTrend } = useWeeklySentimentTrend();
  const todayMood = todayMoodData.mood || 'unknown';
  const todaySentiment = todayMoodData.sentiment || 'unknown';
  const sentimentColors = { positive: '#4ade80', neutral: '#a18aff', negative: '#f87171', anxious: '#fbbf24', hopeful: '#38bdf8', frustrated: '#f87171', grateful: '#34d399', sad: '#818cf8', joyful: '#f472b6', unknown: '#a1a1aa' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-10">
      {/* Greeting & Prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand mb-1">{todayEntry ? 'Add Log' : 'What’s on your mind today?'}</h1>
          <div className="text-gray-500 dark:text-gray-400">
            {todayEntry ? 'Add a new log or reflect on your day.' : 'Start a new entry and dump your thoughts.'}
          </div>
        </div>
        {!todayEntry && (
          <Button size="lg" className="px-8 py-3 text-lg font-semibold shadow-dreamy" onClick={() => navigate('/journals/new', { state: { from: location.pathname } })}>
            + New Entry
          </Button>
        )}
      </div>
      {/* Today's Entry with Logs or Empty State */}
      {todayEntry ? (
        <div className="max-w-xl mx-auto bg-white/80 dark:bg-background-dark/80 rounded-2xl shadow-dreamy p-8 mb-8">
          <div className="text-xs text-gray-400 mb-3 font-semibold tracking-wide uppercase">{formatDate(todayEntry.updatedAt)}</div>
          <div className="font-heading text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{todayEntry.title}</div>
          {/* Tags */}
          {todayEntry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {todayEntry.tags.map(tag => (
                <span key={tag} className="bg-brand/20 text-brand font-semibold px-3 py-1 rounded-full text-xs">#{tag}</span>
              ))}
            </div>
          )}
          {/* Logs Timeline */}
          <div className="mb-4 max-h-32 overflow-y-auto pr-2">
            {todayEntry.logs.length === 0 ? (
              <div className="text-gray-400 italic">No logs yet.</div>
            ) : (
              todayEntry.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 mb-2">
                  <span className="w-2 h-2 mt-2 rounded-full bg-brand"></span>
                  <div>
                    <div className="text-sm text-gray-800 dark:text-gray-100">{log.content}</div>
                    <div className="text-xs text-gray-400">{formatTime(log.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Add Log Input */}
          <form onSubmit={handleAddLog} className="flex gap-2 mt-4">
            <input
              type="text"
              value={newLog}
              onChange={e => setNewLog(e.target.value)}
              placeholder="Add a new log..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100"
              required
            />
            <Button type="submit" className="px-6" disabled={addingLog}>{addingLog ? "Adding..." : "Add Log"}</Button>
          </form>
          {/* Summary */}
          {todayEntry.summary && (
            <blockquote className="bg-brand/10 dark:bg-brand/20 rounded-lg p-4 mt-6 text-gray-800 dark:text-gray-100 italic border-l-4 border-brand">
              {todayEntry.summary}
            </blockquote>
          )}
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white/80 dark:bg-background-dark/80 rounded-2xl shadow-dreamy p-8 mb-8 flex flex-col items-center justify-center text-center">
          <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
            <ellipse cx="32" cy="32" rx="28" ry="16" fill="#a18aff" fillOpacity="0.15" />
            <path d="M20 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#a18aff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="28" r="4" fill="#a18aff" fillOpacity="0.4" />
          </svg>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">It’s awkwardly quiet in here.</div>
          <div className="text-gray-500 dark:text-gray-400 mb-2">Start dumping your thoughts and let Lumora do the rest.</div>
        </div>
      )}
      {/* Mood & Sentiment Widget + Line Graph */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="bg-white/70 dark:bg-background-dark/70 rounded-xl shadow p-6 flex items-center gap-4">
          <span className="text-3xl">😊</span>
      <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Today’s Mood</div>
            <div className="font-semibold text-brand capitalize">{loadingMood ? '...' : todayMood}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sentiment: <span className="capitalize">{loadingMood ? '...' : todaySentiment}</span></div>
          </div>
        </div>
        {/* Simple SVG Line Graph for Sentiment Trend */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sentiment Trend (Past 7 Days)</div>
          {loadingTrend ? (
            <div>Loading...</div>
          ) : (
            <svg width="220" height="60" viewBox="0 0 220 60" fill="none">
              <polyline
                fill="none"
                stroke="#a18aff"
                strokeWidth="3"
                points={sentimentTrend.map((v, i) => `${20 + i * 30},${30 - (v && sentimentColors[v] ? (v === 'positive' ? 1 : v === 'negative' ? -1 : 0) * 20 : 0)}`).join(' ')}
              />
              {sentimentTrend.map((v, i) => (
                <circle
                  key={i}
                  cx={20 + i * 30}
                  cy={30 - (v && sentimentColors[v] ? (v === 'positive' ? 1 : v === 'negative' ? -1 : 0) * 20 : 0)}
                  r="6"
                  fill={sentimentColors[v] || '#a1a1aa'}
                  stroke="#fff"
                  strokeWidth="2"
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* See Past Entries */}
      <div className="flex justify-end">
        <Button variant="outline" className="px-6 py-2" onClick={() => navigate('/journals', { state: { from: location.pathname } })}>
          See All Past Entries
        </Button>
      </div>
    </div>
  );
}

function Register() {
  const [error, setError] = React.useState("");
  const handleRegister = async ({ email, password }) => {
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("token", data.token);
      window.location.href = "/journals";
    } catch (err) {
      setError(err.message);
    }
  };
  return <AuthForm mode="register" onSubmit={handleRegister} error={error} />;
}

function Login() {
  const [error, setError] = React.useState("");
  const handleLogin = async ({ email, password }) => {
    setError("");
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      window.location.href = "/journals";
    } catch (err) {
      setError(err.message);
    }
  };
  return <AuthForm mode="login" onSubmit={handleLogin} error={error} />;
}

function JournalList() {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/journals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch entries");
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntries();
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: undefined,
    });
  }

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Journal Entries</h2>
        <Button onClick={() => navigate('/journals/new', { state: { from: location.pathname } })}>
          + New Entry
        </Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4">
            <ellipse cx="32" cy="32" rx="28" ry="16" fill="#a18aff" fillOpacity="0.15" />
            <path d="M20 40c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#a18aff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="28" r="4" fill="#a18aff" fillOpacity="0.4" />
          </svg>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">Your mind is quiet.</div>
          <div className="text-gray-500 dark:text-gray-400 text-center">What’s on your mind today?</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="group block bg-white/80 dark:bg-background-dark/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-dreamy p-8 w-full max-w-md mx-auto transition hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              onClick={() => navigate(`/journals/${entry._id}`, { state: { from: location.pathname } })}
            >
              {/* Date at the top */}
              <div className="text-xs text-gray-400 mb-3 font-semibold tracking-wide uppercase">{formatDate(entry.updatedAt)}</div>
              {/* Tags */}
              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {entry.tags.map(tag => (
                    <span key={tag} className="bg-brand/20 text-brand font-semibold px-3 py-1 rounded-full text-xs">#{tag}</span>
                  ))}
                </div>
              )}
              {/* Title */}
              <div className="font-heading text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{entry.title}</div>
              {/* Summary */}
              {entry.summary && (
                <blockquote className="bg-brand/10 dark:bg-brand/20 rounded-lg p-3 mb-3 text-gray-800 dark:text-gray-100 italic border-l-4 border-brand">
                  {entry.summary}
                </blockquote>
              )}
              {/* Sentiment only */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                {entry.sentiment && (
                  <span className="flex items-center gap-1 font-semibold">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                    {entry.sentiment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EntryEditor() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate ? useNavigate() : (v) => (window.location.href = v);
  const isNew = id === "new";
  const [entry, setEntry] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(!isNew);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isNew) {
      const fetchEntry = async () => {
        setLoading(true);
        setError("");
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:3000/api/journals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch entry");
          setEntry(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchEntry();
    }
  }, [id, isNew]);

  // Use the 'from' state for context-aware navigation
  const from = location.state?.from || "/journals";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const url = isNew
        ? "http://localhost:3000/api/journals"
        : `http://localhost:3000/api/journals/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: isNew ? title : entry?.title, content: isNew ? content : entry?.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save entry");
      navigate(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/journals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete entry");
      navigate(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form
      onSubmit={handleSave}
      className="bg-white/80 dark:bg-background-dark/80 rounded-2xl shadow-dreamy max-w-xl mx-auto mt-12 p-8 flex flex-col gap-6"
    >
      <h2 className="text-3xl font-heading font-bold text-brand mb-2">{isNew ? "New Entry" : "Edit Entry"}</h2>
      {/* Tags */}
      {entry && entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {entry.tags.map(tag => (
            <span key={tag} className="bg-brand/20 text-brand font-semibold px-3 py-1 rounded-full text-xs">#{tag}</span>
          ))}
        </div>
      )}
      {/* Summary */}
      {entry && entry.summary && (
        <blockquote className="bg-brand/10 dark:bg-brand/20 rounded-lg p-4 mb-2 text-gray-800 dark:text-gray-100 italic border-l-4 border-brand">
          {entry.summary}
        </blockquote>
      )}
      {/* Title Input */}
      <Input
        type="text"
        placeholder="Title"
        value={isNew ? title : entry?.title || ""}
        onChange={e => isNew ? setTitle(e.target.value) : setEntry({ ...entry, title: e.target.value })}
        required
        className="text-xl font-bold px-4 py-3 mb-2 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg border border-gray-200 dark:border-gray-700"
      />
      {/* Content Textarea */}
      <textarea
        className="w-full min-h-[160px] border rounded-lg p-4 bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base mb-2"
        placeholder="Write your journal entry..."
        value={isNew ? content : entry?.content || ""}
        onChange={e => isNew ? setContent(e.target.value) : setEntry({ ...entry, content: e.target.value })}
        required
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {/* Actions */}
      <div className="flex gap-4 mt-2">
        <Button type="submit" disabled={saving} className="px-6 py-2 text-base font-semibold">
          {saving ? "Saving..." : "Save"}
        </Button>
        {!isNew && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving} className="px-6 py-2 text-base font-semibold">
            Delete
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => navigate(from)} className="px-6 py-2 text-base font-semibold">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/journals"
            element={
              <ProtectedRoute>
                <JournalList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journals/:id"
            element={
              <ProtectedRoute>
                <EntryEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
