"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  BarChart3,
  Activity,
  Heart,
  Brain,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react"
import useWeeklySentimentTrend from "../hooks/useWeeklySentimentTrend"
import getSentimentColor from "../utils/getSentimentColor"
import getMoodIcon from "../utils/getMoodIcon.jsx"
import { utcToZonedTime, format as formatTz } from 'date-fns-tz';

function SentimentBar({ sentiment, day, isToday }) {
  const getSentimentHeight = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
      case "joyful":
      case "grateful":
        return "h-16"
      case "hopeful":
        return "h-14"
      case "neutral":
      case "calm":
        return "h-10"
      case "anxious":
        return "h-8"
      case "frustrated":
        return "h-6"
      case "sad":
        return "h-4"
      case "negative":
        return "h-2"
      default:
        return "h-1"
    }
  }

  const getSentimentLabel = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "Positive"
      case "joyful":
        return "Joyful"
      case "grateful":
        return "Grateful"
      case "hopeful":
        return "Hopeful"
      case "neutral":
        return "Neutral"
      case "calm":
        return "Calm"
      case "anxious":
        return "Anxious"
      case "frustrated":
        return "Frustrated"
      case "sad":
        return "Sad"
      case "negative":
        return "Negative"
      default:
        return "No Entry"
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <div
          className={`w-8 rounded-t-lg transition-all duration-300 ${
            sentiment ? getSentimentColor(sentiment) : "bg-gray-200 dark:bg-gray-700"
          } ${sentiment ? getSentimentHeight(sentiment) : "h-1"}`}
        />
        {sentiment && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            {getMoodIcon(sentiment)}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className={`text-xs font-medium ${isToday ? "text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400"}`}>
          {day}
        </div>
        {sentiment && (
          <div className="text-xs text-gray-500 mt-1">
            {getSentimentLabel(sentiment)}
          </div>
        )}
      </div>
    </div>
  )
}

function WeeklyTrendChart({ sentimentTrend, loading }) {
  // Generate the correct day labels for the past 7 days
  const generateDayLabelsIST = () => {
    const labels = [];
    const today = utcToZonedTime(new Date(), 'Asia/Kolkata');
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const istDate = utcToZonedTime(date, 'Asia/Kolkata');
      const dayName = formatTz(istDate, 'EEE', { timeZone: 'Asia/Kolkata' });
      labels.push(dayName);
    }
    return labels;
  }

  const days = generateDayLabelsIST()
  const todayIndex = 6 // Last element is today

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Weekly Sentiment Trend</h3>
        <Badge variant="secondary" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
          <Activity className="w-3 h-3 mr-1" />
          Last 7 Days
        </Badge>
      </div>

      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-violet-100/50 dark:border-violet-800/30">
        <div className="flex items-end justify-between h-32 mb-4">
          {sentimentTrend.map((sentiment, index) => (
            <SentimentBar
              key={index}
              sentiment={sentiment}
              day={days[index]}
              isToday={index === todayIndex}
            />
          ))}
        </div>

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Negative</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeeklyInsights({ sentimentTrend }) {
  const validSentiments = sentimentTrend.filter(s => s !== null)
  
  if (validSentiments.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-violet-500" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Weekly Insights</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start journaling to see your weekly insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const positiveCount = validSentiments.filter(s => 
    ['positive', 'joyful', 'grateful', 'hopeful'].includes(s?.toLowerCase())
  ).length

  const negativeCount = validSentiments.filter(s => 
    ['negative', 'sad', 'frustrated', 'anxious'].includes(s?.toLowerCase())
  ).length

  const neutralCount = validSentiments.filter(s => 
    ['neutral', 'calm'].includes(s?.toLowerCase())
  ).length

  const totalEntries = validSentiments.length
  const positivePercentage = Math.round((positiveCount / totalEntries) * 100)
  const negativePercentage = Math.round((negativeCount / totalEntries) * 100)
  const neutralPercentage = Math.round((neutralCount / totalEntries) * 100)

  return (
    <Card className="border-0 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-violet-500" />
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">Weekly Insights</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Positive Days</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${positivePercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{positivePercentage}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Neutral Days</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${neutralPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{neutralPercentage}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Challenging Days</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${negativePercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{negativePercentage}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-violet-200/50 dark:border-violet-800/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Entries</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{totalEntries}/7 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WeeklyTrend() {
  const navigate = useNavigate()
  const { data: sentimentTrend, loading, error, refetch } = useWeeklySentimentTrend()

  const safeSentimentTrend = Array.isArray(sentimentTrend) ? sentimentTrend : []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-violet-200/20 dark:bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Header */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Weekly Trends
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track your emotional journey over the past week
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={refetch}
              disabled={loading}
              className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Error Loading Data</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Chart */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
              <CardContent className="p-8">
                <div className="pt-4">
                  <WeeklyTrendChart sentimentTrend={safeSentimentTrend} loading={loading} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <div className="space-y-6">
            <div className="pt-4">
              <WeeklyInsights sentimentTrend={safeSentimentTrend} />
            </div>

            {/* Quick Stats */}
            <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
              <CardContent className="p-6">
                <div className="pt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-violet-500" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Quick Stats</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Days with Entries</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {safeSentimentTrend.filter(s => s !== null).length}/7
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Most Common Mood</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {(() => {
                        const validSentiments = safeSentimentTrend.filter(s => s !== null)
                        if (validSentiments.length === 0) return "None"
                        
                        const counts = {}
                        validSentiments.forEach(s => {
                          counts[s] = (counts[s] || 0) + 1
                        })
                        
                        const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
                        return mostCommon ? mostCommon[0] : "None"
                      })()}
                    </span>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 