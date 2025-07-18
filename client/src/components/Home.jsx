import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Clock, Plus, Sparkles, Heart, Brain, Edit3, Calendar, TrendingUp, Loader2, BookOpen } from "lucide-react";
import useTodaysEntriesWithRefetch from "../hooks/useTodaysEntriesWithRefetch";
import useTodayMood from "../hooks/useTodayMood";
import useWeeklySentimentTrend from "../hooks/useWeeklySentimentTrend";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import formatDate from "../utils/formatDate";
import formatTime from "../utils/formatTime";
import getMoodIcon from "../utils/getMoodIcon.jsx";
import getSentimentColor from "../utils/getSentimentColor";

export default function Home() {
  const isLoggedIn = !!localStorage.getItem("token")
  const navigate = useNavigate()
  const location = useLocation()

  const {
    data: todaysEntries,
    loading: loadingToday,
    error: errorToday,
    refetch: refetchToday,
  } = useTodaysEntriesWithRefetch()
  const { data: todayMoodData, loading: loadingMood, refetch: refetchMood } = useTodayMood();
  const { data: sentimentTrend, loading: loadingTrend, refetch: refetchTrend } = useWeeklySentimentTrend();

  const todayEntry = todaysEntries[0]
  const [newLog, setNewLog] = useState("")
  const [addingLog, setAddingLog] = useState(false)

  useEffect(() => {
    if (location.state?.refetch) {
      refetchToday && refetchToday();
      refetchTrend && refetchTrend();
      refetchMood && refetchMood();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetchToday, refetchTrend, refetchMood]);

  const handleAddLog = async (e) => {
    e.preventDefault()
    if (!newLog.trim()) return

    setAddingLog(true)
    try {
      const token = localStorage.getItem("token")
      await fetch("http://localhost:3000/api/journals/today/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newLog }),
      })
      setNewLog("")
      refetchToday()
    } catch (err) {
      console.error("Failed to add log:", err)
    } finally {
      setAddingLog(false)
    }
  }

  const safeSentimentTrend = Array.isArray(sentimentTrend) ? sentimentTrend : []
  const todayMood = todayMoodData.mood || "unknown"
  const todaySentiment = todayMoodData.sentiment || "unknown"

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          {todayEntry ? "Welcome back!" : "What's on your mind today?"}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {todayEntry
            ? "Continue your wellness journey by adding new thoughts or reflections."
            : "Start your mindful journey by creating your first journal entry."}
        </p>
      </div>

      {/* Today's Entry or Empty State */}
      {todayEntry ? (
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-violet-500" />
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {todayEntry.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(todayEntry.updatedAt)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/journals/${todayEntry._id}`)}
                className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Tags */}
            {todayEntry.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {todayEntry.tags.map((tag) => (
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
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Summary */}
            {todayEntry.summary && (
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-violet-500">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-violet-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Summary</h4>
                    <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">{todayEntry.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logs Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Today's Logs</span>
              </h4>

              {todayEntry.logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No logs yet today.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {todayEntry.logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200">{log.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Log Form */}
              <form onSubmit={handleAddLog} className="flex space-x-3">
                <Input
                  type="text"
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  placeholder="Add a quick thought or reflection..."
                  className="flex-1 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500"
                  required
                />
                <Button
                  type="submit"
                  disabled={addingLog}
                  className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                >
                  {addingLog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Your mind is quiet today"
          description="Start your wellness journey by creating your first journal entry. Share your thoughts, feelings, and reflections in a safe, private space."
          action={
            <Button
              size="lg"
              onClick={() => navigate("/journals/new", { state: { from: location.pathname } })}
              className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Entry
            </Button>
          }
        />
      )}

      {/* Mood & Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Mood */}
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Heart className="w-5 h-5 text-violet-500" />
              <span>Today's Mood</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMood ? (
              <LoadingSpinner />
            ) : (
              <div className="flex items-center space-x-4">
                {getMoodIcon(todayMood)}
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 capitalize">{todayMood}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sentiment: <span className="capitalize font-medium">{todaySentiment}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Trend */}
        <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <span>7-Day Sentiment Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTrend ? (
              <LoadingSpinner />
            ) : (
              <div className="flex items-center justify-center">
                <svg width="280" height="80" viewBox="0 0 280 80" className="overflow-visible">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="280" height="80" fill="url(#grid)" />

                  {/* Trend line */}
                  {safeSentimentTrend.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={safeSentimentTrend
                        .map((sentiment, i) => {
                          const x = 40 + i * 35
                          const y = 40 - (sentiment === "positive" ? 20 : sentiment === "negative" ? -20 : 0)
                          return `${x},${y}`
                        })
                        .join(" ")}
                    />
                  )}

                  {/* Data points */}
                  {safeSentimentTrend.map((sentiment, i) => {
                    const x = 40 + i * 35;
                    const y = 40 - (sentiment === "positive" ? 20 : sentiment === "negative" ? -20 : 0);
                    if (!sentiment) {
                      // Transparent circle for no entry
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={40}
                          r="6"
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                        />
                      );
                    }
                    // Filled colored circle for sentiment
                    const colorMap = {
                      positive: "#22c55e",
                      neutral: "#3b82f6",
                      negative: "#ef4444",
                      anxious: "#eab308",
                      hopeful: "#06b6d4",
                      frustrated: "#ef4444",
                      grateful: "#10b981",
                      sad: "#6366f1",
                      joyful: "#ec4899",
                      unknown: "#6b7280",
                    };
                    const fill = colorMap[sentiment] || colorMap.unknown;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="6"
                        fill={fill}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/journals")}
          className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          View All Entries
        </Button>
      </div>
    </div>
  )
} 