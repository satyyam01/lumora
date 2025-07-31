"use client"
import { useEffect, useMemo, useCallback, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Clock,
  Plus,
  Sparkles,
  Heart,
  Brain,
  Edit3,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  Award,
  Sun,
  Moon,
  Star,
  ArrowRight,
  MessageCircle,
  PenTool,
  BarChart3,
  Flame,
  CheckCircle2,
  ChevronRight,
  Activity,
  Users,
  Globe,
} from "lucide-react"
import useTodaysEntriesWithRefetch from "../hooks/useTodaysEntriesWithRefetch"
import useTodayMood from "../hooks/useTodayMood"
import useWeeklySentimentTrend from "../hooks/useWeeklySentimentTrend"
import useStreakData from "../hooks/useStreakData"
import GoalProgressCard from "./GoalProgressCard"
import formatTime from "../utils/formatTime"
import getSentimentColor from "../utils/getSentimentColor"

// Enhanced utility functions
function getTimeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { greeting: "Good morning", icon: Sun, color: "text-yellow-500" }
  if (hour < 17) return { greeting: "Good afternoon", icon: Sun, color: "text-orange-500" }
  return { greeting: "Good evening", icon: Moon, color: "text-indigo-500" }
}



function getInsightOfTheDay() {
  const insights = [
    "Regular journaling can improve mental clarity by up to 25%",
    "Writing about gratitude increases happiness levels significantly",
    "Reflecting on your day helps process emotions more effectively",
    "Mindful writing reduces stress and anxiety naturally",
    "Consistent journaling builds stronger self-awareness",
  ]
  return insights[Math.floor(Math.random() * insights.length)]
}

function DailyInspiration() {
  const [currentInsight, setCurrentInsight] = useState(getInsightOfTheDay())

  // Refresh inspiration every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight(getInsightOfTheDay())
    }, 120000) // 2 minutes = 120,000 ms

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-md shadow-xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Daily Inspiration</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed max-w-2xl mx-auto">
          "{currentInsight}"
        </p>
        <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center space-x-1">
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Components
function WelcomeHero({ todayEntry, onCreateEntry, streakData, loadingStreak, onChatWithLumora }) {
  const { greeting, icon: TimeIcon, color } = getTimeOfDayGreeting()

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-violet-300/20 dark:bg-violet-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-20 right-16 w-24 h-24 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center space-y-6 py-12">
        {/* Time-based greeting */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="flex items-center space-x-2">
              <TimeIcon className={`w-5 h-5 ${color}`} />
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400">{greeting}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back!
            </h1>
          </div>
        </div>

        {/* Dynamic subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {todayEntry
            ? "Ready to continue your mindful journey? Your thoughts are waiting to be explored."
            : "Your mind is a canvas waiting for today's thoughts. What story will you tell?"}
        </p>

        {/* Streak display */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />
              {loadingStreak ? (
                <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
              ) : (
                <span className="text-2xl font-bold text-orange-500">{streakData.current}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
          </div>
          <div className="w-px h-8 bg-violet-200 dark:bg-violet-700"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Award className="w-5 h-5 text-violet-500" />
              {loadingStreak ? (
                <div className="w-8 h-8 bg-violet-500 rounded-full animate-pulse"></div>
              ) : (
                <span className="text-2xl font-bold text-violet-500">{streakData.longest}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
          </div>
          <div className="w-px h-8 bg-violet-200 dark:bg-violet-700"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {loadingStreak ? (
                <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
              ) : (
                <span className="text-2xl font-bold text-green-500">{streakData.thisWeek}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            size="lg"
            onClick={onCreateEntry}
            className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            {todayEntry ? "Add New Entry" : "Start Writing"}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onChatWithLumora}
            className="text-lg px-8 py-6 rounded-2xl border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm group"
          >
            <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Chat with Lumora
          </Button>
        </div>
      </div>
    </div>
  )
}

function TodayEntryCard({ entry, onEdit, onChat, onViewDetails }) {
  return (
    <Card className="group border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Today's Entry</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Active
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {entry.title}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>Last updated {formatTime(entry.updatedAt)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onChat}
              className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {entry.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 hover:bg-violet-200 dark:hover:bg-violet-800/40 transition-colors cursor-pointer"
              >
                #{tag}
              </Badge>
            ))}
            {entry.tags.length > 4 && (
              <Badge variant="outline" className="text-gray-500">
                +{entry.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Summary with enhanced styling */}
        {entry.summary && (
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-violet-200/50 dark:border-violet-800/30 shadow-inner">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center space-x-2">
                  <span>Summary</span>
                  <Sparkles className="w-4 h-4 text-violet-500" />
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">"{entry.summary}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Entry stats */}
        <div className="flex items-center justify-between pt-4 border-t border-violet-100/50 dark:border-violet-800/30">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>{entry.content?.length || 0} characters</span>
            </div>
            {entry.sentiment && (
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${getSentimentColor(entry.sentiment)}`}></div>
                <span className="capitalize">{entry.sentiment}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 group"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function MoodAnalyticsCard({ todayMood, todaySentiment, loading }) {
  // Add error boundary for this component
  if (loading === undefined || todayMood === undefined) {
    return (
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Component Error</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load mood data</p>
        </CardContent>
      </Card>
    )
  }
  const moodEmojis = {
    positive: "😊",
    joyful: "😄",
    grateful: "🙏",
    hopeful: "🌟",
    neutral: "😌",
    calm: "🧘",
    anxious: "😰",
    frustrated: "😤",
    sad: "😢",
    negative: "😔",
    unknown: "💭",
  }

  const moodColors = {
    positive: "from-green-400 to-emerald-500",
    joyful: "from-yellow-400 to-orange-500",
    grateful: "from-emerald-400 to-teal-500",
    hopeful: "from-cyan-400 to-blue-500",
    neutral: "from-blue-400 to-indigo-500",
    calm: "from-indigo-400 to-purple-500",
    anxious: "from-yellow-400 to-red-500",
    frustrated: "from-red-400 to-pink-500",
    sad: "from-indigo-400 to-blue-600",
    negative: "from-gray-400 to-gray-600",
    unknown: "from-violet-400 to-blue-500",
  }

  return (
    <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center space-x-3 text-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-gray-800 dark:text-gray-200">Today's Mood</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">How you're feeling</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        ) : !todayMood || todayMood === "unknown" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💭</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No mood data yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Write a journal entry to see your mood insights</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main mood display */}
            <div className="text-center">
              <div
                className={`w-20 h-20 bg-gradient-to-br ${moodColors[todayMood] || moodColors.unknown} rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl`}
              >
                <span className="text-3xl">{moodEmojis[todayMood] || moodEmojis.unknown}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 capitalize mb-1">{todayMood}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sentiment:{" "}
                <span className="capitalize font-medium text-violet-600 dark:text-violet-400">{todaySentiment}</span>
              </p>
            </div>

            {/* Mood insights */}
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/30">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Mood Insight</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">{getInsightOfTheDay()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SentimentTrendCard({ sentimentTrend, loading, onViewFullTrend }) {
  // Add error boundary for this component
  if (loading === undefined || sentimentTrend === undefined) {
    return (
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Component Error</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load trend data</p>
        </CardContent>
      </Card>
    )
  }

  const safeSentimentTrend = Array.isArray(sentimentTrend) ? sentimentTrend : []

  return (
    <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="flex items-center space-x-3 text-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-gray-800 dark:text-gray-200">Weekly Trend</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">7-day sentiment analysis</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        ) : safeSentimentTrend.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No trend data yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Write more journal entries to see your weekly trend</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Enhanced chart */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/30">
              <svg width="100%" height="120" viewBox="0 0 320 120" className="overflow-visible">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5" />
                  </pattern>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect width="320" height="120" fill="url(#grid)" />

                {/* Trend line with glow effect */}
                {safeSentimentTrend.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="url(#trendGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="drop-shadow(0 0 6px rgba(139, 92, 246, 0.3))"
                      points={safeSentimentTrend
                        .map((sentiment, i) => {
                          const x = 40 + i * 40
                          const y = 60 - (sentiment === "positive" ? 30 : sentiment === "negative" ? -30 : 0)
                          return `${x},${y}`
                        })
                        .join(" ")}
                    />
                  </>
                )}

                {/* Enhanced data points */}
                {safeSentimentTrend.map((sentiment, i) => {
                  const x = 40 + i * 40
                  const y = 60 - (sentiment === "positive" ? 30 : sentiment === "negative" ? -30 : 0)
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
                  }
                  const fill = colorMap[sentiment] || colorMap.unknown

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill={fill}
                        stroke="#fff"
                        strokeWidth="3"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                      <circle cx={x} cy={y} r="4" fill="#fff" opacity="0.8" />
                    </g>
                  )
                })}

                {/* Day labels */}
                {(() => {
                  const labels = []
                  const today = new Date()
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today)
                    date.setDate(today.getDate() - i)
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                    labels.push(dayName)
                  }
                  return labels.map((day, i) => (
                  <text
                    key={day}
                    x={40 + i * 40}
                    y={110}
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                  >
                    {day}
                  </text>
                  ))
                })()}
              </svg>
            </div>

            {/* Trend summary */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Positive</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Neutral</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Negative</span>
              </div>
            </div>

            {/* View Full Trend Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewFullTrend}
                className="w-full border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Full Trend
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



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
  const { data: todayMoodData, loading: loadingMood, refetch: refetchMood } = useTodayMood()
  const { data: sentimentTrend, loading: loadingTrend, refetch: refetchTrend } = useWeeklySentimentTrend()
  const { data: streakData, loading: loadingStreak, refetch: refetchStreak } = useStreakData()

  const todayEntry = todaysEntries[0]

  useEffect(() => {
    if (location.state?.refetch) {
      refetchToday && refetchToday()
      refetchTrend && refetchTrend()
      refetchMood && refetchMood()
      refetchStreak && refetchStreak()
      window.history.replaceState({}, document.title)
    }
  }, [location.state, refetchToday, refetchTrend, refetchMood, refetchStreak])

  // Refetch data when component mounts or user returns to page
  useEffect(() => {
    const handleFocus = () => {
      // Refetch data when user returns to the tab/window
      refetchToday && refetchToday()
      refetchTrend && refetchTrend()
      refetchMood && refetchMood()
      refetchStreak && refetchStreak()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refetch when page becomes visible
        refetchToday && refetchToday()
        refetchTrend && refetchTrend()
        refetchMood && refetchMood()
        refetchStreak && refetchStreak()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refetchToday, refetchTrend, refetchMood, refetchStreak])



  const safeSentimentTrend = useMemo(() => Array.isArray(sentimentTrend) ? sentimentTrend : [], [sentimentTrend])
  const todayMood = useMemo(() => todayMoodData?.mood || "unknown", [todayMoodData?.mood])
  const todaySentiment = useMemo(() => todayMoodData?.sentiment || "unknown", [todayMoodData?.sentiment])

  // Remove debug logging for production

  const handleCreateEntry = () => {
    navigate("/journals/new", { state: { from: location.pathname } })
  }

  const handleEditEntry = () => {
    if (todayEntry) {
      navigate(`/journals/${todayEntry._id}`)
    }
  }

  const handleChatWithEntry = () => {
    if (todayEntry) {
      navigate(`/chat?entryId=${todayEntry._id}`)
    }
  }

  const handleViewDetails = () => {
    if (todayEntry) {
      navigate(`/journals/${todayEntry._id}`);
    }
  };

  const handleChatWithLumora = () => {
    navigate("/chat");
  };

  const handleViewFullTrend = () => {
    navigate("/weekly-trend");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-blue-50/50 to-indigo-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Hero Section */}
          <WelcomeHero 
            todayEntry={todayEntry} 
            onCreateEntry={handleCreateEntry} 
            streakData={streakData}
            loadingStreak={loadingStreak}
            onChatWithLumora={handleChatWithLumora}
          />

          {/* Today's Entry Section */}
          {todayEntry && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Today's Reflection</h2>
              </div>
              <TodayEntryCard entry={todayEntry} onEdit={handleEditEntry} onChat={handleChatWithEntry} onViewDetails={handleViewDetails} />
            </div>
          )}

          {/* Analytics Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Wellness Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MoodAnalyticsCard 
                key={`mood-${todayMood}-${loadingMood}`}
                todayMood={todayMood} 
                todaySentiment={todaySentiment} 
                loading={loadingMood} 
              />
              <SentimentTrendCard 
                key={`trend-${safeSentimentTrend.length}-${loadingTrend}`}
                sentimentTrend={safeSentimentTrend} 
                loading={loadingTrend} 
                onViewFullTrend={handleViewFullTrend}
              />
            </div>
          </div>

          {/* Goal Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your Goals</h2>
            </div>
            <GoalProgressCard />
          </div>



          {/* Daily Inspiration */}
          <DailyInspiration />
        </div>
      </div>
    </div>
  )
}
