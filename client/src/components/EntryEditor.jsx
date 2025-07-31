import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Brain, PenTool, Sparkles, Loader2, Save, Trash2, AlertCircle, Calendar } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

// Helper to get midnight IST in UTC for a given YYYY-MM-DD string
function getISTMidnightUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Subtract one day for UTC, then set 18:30
  const utcDate = new Date(Date.UTC(year, month - 1, day - 1, 18, 30, 0, 0));
  return utcDate.toISOString();
}

export default function EntryEditor() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [entry, setEntry] = useState(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingLogId, setEditingLogId] = useState(null);
  const [logEditValue, setLogEditValue] = useState("");
  const [logError, setLogError] = useState("");

  useEffect(() => {
    if (!isNew) {
      const fetchEntry = async () => {
        setLoading(true)
        setError("")
        try {
          const token = localStorage.getItem("token")
          const res = await fetch(`http://localhost:3000/api/journals/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "Failed to fetch entry")
          setEntry(data)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchEntry()
    }
  }, [id, isNew])

  const from = location.state?.from || "/journals"

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const url = isNew ? "http://localhost:3000/api/journals" : `http://localhost:3000/api/journals/${id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: isNew ? title : entry?.title,
          content: isNew ? content : entry?.content,
          createdForDate: isNew ? getISTMidnightUTC(selectedDate) : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save entry")
      
      // If this is a new entry, navigate back with a refetch flag
      if (isNew) {
        navigate(from, { state: { refetch: true } })
      } else {
      navigate(from)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isNew) return;
    const confirmed = window.confirm("Are you sure you want to delete this entry? This action cannot be undone.");
    if (!confirmed) return;
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

  // Edit log handler (stub)
  const handleEditLog = (logId, content) => {
    setEditingLogId(logId);
    setLogEditValue(content);
    setLogError("");
  };

  const fetchEntry = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/journals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        setError("This entry no longer exists.");
        setEntry(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch entry");
      setEntry(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogEdit = async (logId) => {
    setLogError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/journals/${id}/logs/${logId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: logEditValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update log");
      setEditingLogId(null);
      setLogEditValue("");
      navigate("/dashboard", { state: { refetch: true } });
    } catch (err) {
      setLogError(err.message);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Delete this log? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/api/journals/${id}/logs/${logId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete log");
      navigate("/dashboard", { state: { refetch: true } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(from)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {isNew ? "New Journal Entry" : "Edit Entry"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isNew ? "Express your thoughts and feelings freely" : "Update your thoughts and reflections"}
            </p>
          </div>
        </div>
      </div>

      {/* Editor Card */}
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-8">
          {/* Entry metadata for existing entries */}
          {entry && (
            <div className="mb-6 space-y-4">
              {/* Spacer above tags */}
              <div className="h-5" />
              {/* Tags */}
              {entry.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Summary */}
              {entry.summary && (
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-violet-500">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-violet-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">AI Summary</h4>
                      <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">{entry.summary}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Spacer above Entry Title (for new entry) */}
            {isNew && <div className="h-10" />}
            {/* Title Input */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <PenTool className="w-4 h-4" />
                <span>Entry Title</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="What's on your mind today?"
                value={isNew ? title : entry?.title || ""}
                onChange={(e) => (isNew ? setTitle(e.target.value) : setEntry({ ...entry, title: e.target.value }))}
                required
                className="text-xl font-semibold h-14 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500"
              />
            </div>

            {/* Date Selector - Only for new entries */}
            {isNew && (
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Entry Date</span>
                </label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={(() => {
                    const today = new Date()
                    const year = today.getFullYear()
                    const month = String(today.getMonth() + 1).padStart(2, '0')
                    const day = String(today.getDate()).padStart(2, '0')
                    return `${year}-${month}-${day}`
                  })()}
                  className="h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose the date this entry is for (cannot be in the future)
                </p>
              </div>
            )}

            {/* Content Textarea */}
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Your Thoughts</span>
              </label>
              <Textarea
                id="content"
                placeholder="Pour your heart out... Share your thoughts, feelings, experiences, or reflections. This is your safe space to express yourself freely."
                value={isNew ? content : entry?.content || ""}
                onChange={(e) => (isNew ? setContent(e.target.value) : setEntry({ ...entry, content: e.target.value }))}
                required
                className="min-h-[300px] resize-none bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 text-base leading-relaxed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Express yourself freely - your thoughts are private and secure
              </p>
            </div>

            {/* Logs Section */}
            {entry && entry.logs && entry.logs.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 text-violet-700 dark:text-violet-300">Logs</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {entry.logs.map((log, idx) => (
                    <div key={log._id || idx} className="bg-white/40 dark:bg-gray-800/40 rounded-lg p-4 flex flex-col gap-2 border border-violet-100 dark:border-violet-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditLog(log._id, log.content)} disabled={editingLogId === log._id}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteLog(log._id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                      {editingLogId === log._id ? (
                        <div className="flex flex-col gap-2">
                          <Textarea
                            value={logEditValue}
                            onChange={e => setLogEditValue(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveLogEdit(log._id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingLogId(null)}>
                              Cancel
                            </Button>
                          </div>
                          {logError && <div className="text-xs text-red-500">{logError}</div>}
                        </div>
                      ) : (
                        <div className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-line">
                          {log.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving || (isNew && (!title.trim() || !content.trim()))}
                className="flex-1 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{isNew ? "Create Entry" : "Save Changes"}</span>
                  </div>
                )}
              </Button>

              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 sm:flex-none"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(from)}
                className="flex-1 sm:flex-none border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 