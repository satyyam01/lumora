import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Plus, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import formatDate from "../utils/formatDate";
import formatTime from "../utils/formatTime";
import getSentimentColor from "../utils/getSentimentColor";
import { Alert, AlertDescription } from "./ui/alert";

export default function JournalList() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const location = useLocation()
  const navigate = useNavigate()

  const fetchEntries = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/journals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch entries")
      setEntries(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            My Journal Entries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your personal collection of thoughts, reflections, and insights
          </p>
        </div>
        <Button
          onClick={() => navigate("/journals/new", { state: { from: location.pathname } })}
          className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Entries Grid */}
      {entries.length === 0 ? (
        <EmptyState
          title="Your journal is waiting"
          description="Start your mindfulness journey by creating your first journal entry. Share your thoughts, feelings, and daily reflections."
          action={
            <Button
              size="lg"
              onClick={() => navigate("/journals/new", { state: { from: location.pathname } })}
              className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Entry
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card
              key={entry._id}
              className="group cursor-pointer border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate(`/journals/${entry._id}`, { state: { from: location.pathname } })}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  >
                    {formatDate(entry.updatedAt)}
                  </Badge>
                  {entry.sentiment && (
                    <div className={`w-3 h-3 rounded-full ${getSentimentColor(entry.sentiment)}`}></div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {entry.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tags */}
                {entry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        +{entry.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Summary */}
                {entry.summary && (
                  <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-lg p-3 border-l-4 border-violet-500">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">{entry.summary}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(entry.updatedAt)}</span>
                  </div>
                  {entry.sentiment && (
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getSentimentColor(entry.sentiment)}`}></div>
                      <span className="capitalize">{entry.sentiment}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 