"use client"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Alert, AlertDescription } from "./ui/alert"
import {
  Clock,
  Plus,
  AlertCircle,
  MessageCircle,
  BookOpen,
  Search,
  Filter,
  Calendar,
  Heart,
  Brain,
  Eye,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react"

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: undefined,
  })
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getSentimentColor(sentiment) {
  const colors = {
    positive: "bg-green-500",
    neutral: "bg-blue-500",
    negative: "bg-red-500",
    anxious: "bg-yellow-500",
    hopeful: "bg-cyan-500",
    frustrated: "bg-red-500",
    grateful: "bg-emerald-500",
    sad: "bg-indigo-500",
    joyful: "bg-pink-500",
    unknown: "bg-gray-500",
  }
  return colors[sentiment] || colors.unknown
}

function getSentimentIcon(sentiment) {
  switch (sentiment?.toLowerCase()) {
    case "positive":
    case "joyful":
    case "grateful":
      return "😊"
    case "hopeful":
      return "🌟"
    case "neutral":
    case "calm":
      return "😌"
    case "anxious":
      return "😰"
    case "frustrated":
      return "😤"
    case "sad":
      return "😢"
    case "negative":
      return "😔"
    default:
      return "💭"
  }
}

// Components
function LoadingSpinner({ size = "default" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-violet-500`} />
      <p className="text-gray-600 dark:text-gray-400">Loading your journal entries...</p>
    </div>
  )
}

function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Floating background elements */}
      <div className="relative">
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-violet-200/30 dark:bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -top-4 -right-6 w-12 h-12 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <BookOpen className="w-10 h-10 text-violet-500" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">{description}</p>
      {action}
    </div>
  )
}

function SearchAndFilter({ searchTerm, onSearchChange, selectedSentiment, onSentimentChange, entriesCount }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const sentiments = [
    { value: "", label: "All Moods", icon: "🌈" },
    { value: "positive", label: "Positive", icon: "😊" },
    { value: "neutral", label: "Neutral", icon: "😌" },
    { value: "negative", label: "Negative", icon: "😔" },
    { value: "joyful", label: "Joyful", icon: "😄" },
    { value: "grateful", label: "Grateful", icon: "🙏" },
    { value: "anxious", label: "Anxious", icon: "😰" },
    { value: "hopeful", label: "Hopeful", icon: "🌟" },
  ]

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search your thoughts and reflections..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 bg-white/50 dark:bg-gray-800/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 backdrop-blur-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter by Mood
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </Button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-violet-200 dark:border-violet-700 rounded-xl shadow-xl z-10">
                <div className="p-2 space-y-1">
                  {sentiments.map((sentiment) => (
                    <button
                      key={sentiment.value}
                      onClick={() => {
                        onSentimentChange(sentiment.value)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                        selectedSentiment === sentiment.value
                          ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{sentiment.icon}</span>
                      <span>{sentiment.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedSentiment && (
            <Badge
              variant="secondary"
              className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
            >
              {getSentimentIcon(selectedSentiment)} {selectedSentiment}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSentimentChange("")}
                className="w-4 h-4 ml-1 p-0 hover:bg-violet-200 dark:hover:bg-violet-800"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {entriesCount} {entriesCount === 1 ? "entry" : "entries"}
        </div>
      </div>
    </div>
  )
}

function JournalEntryCard({ entry, onClick, onTalkClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="group cursor-pointer border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
      />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
          >
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(entry.updatedAt)}
          </Badge>

          <div className="flex items-center space-x-2">
            {entry.sentiment && (
              <div className="flex items-center space-x-1">
                <span className="text-sm">{getSentimentIcon(entry.sentiment)}</span>
                <div className={`w-2 h-2 rounded-full ${getSentimentColor(entry.sentiment)}`}></div>
              </div>
            )}
          </div>
        </div>

        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight">
          {entry.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-white/50 dark:bg-gray-700/50"
              >
                #{tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500 bg-white/50 dark:bg-gray-700/50">
                +{entry.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Summary */}
        {entry.summary && (
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-xl p-4 border-l-4 border-violet-500">
            <div className="flex items-start space-x-2">
              <Brain className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">AI Summary</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed line-clamp-3">
                  {entry.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-violet-100/50 dark:border-violet-800/30">
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(entry.updatedAt)}</span>
            </div>
            {entry.sentiment && (
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span className="capitalize">{entry.sentiment}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 px-2 py-1 h-auto"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-2 py-1 h-auto bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onTalkClick()
              }}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function JournalList() {
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSentiment, setSelectedSentiment] = useState("")
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
      setFilteredEntries(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // Filter entries based on search term and sentiment
  useEffect(() => {
    let filtered = entries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by sentiment
    if (selectedSentiment) {
      filtered = filtered.filter((entry) => entry.sentiment === selectedSentiment)
    }

    setFilteredEntries(filtered)
  }, [entries, searchTerm, selectedSentiment])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button
            onClick={fetchEntries}
            variant="outline"
            className="border-violet-200 dark:border-violet-700 bg-transparent"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-violet-200/20 dark:bg-violet-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>

      {/* Header */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  My Journal
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your personal collection of thoughts, reflections, and insights
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/journals/new", { state: { from: location.pathname } })}
            className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      {entries.length > 0 && (
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSentiment={selectedSentiment}
          onSentimentChange={setSelectedSentiment}
          entriesCount={filteredEntries.length}
        />
      )}

      {/* Entries Grid */}
      {entries.length === 0 ? (
        <EmptyState
          title="Your journal awaits"
          description="Begin your mindfulness journey by creating your first journal entry. Share your thoughts, feelings, and daily reflections in a safe, private space."
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
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No entries found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedSentiment("")
            }}
            className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry._id}
              entry={entry}
              onClick={() => navigate(`/journals/${entry._id}`, { state: { from: location.pathname } })}
              onTalkClick={() => navigate(`/chat?entryId=${entry._id}`)}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {entries.length > 0 && (
        <div className="mt-12 p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-violet-100/50 dark:border-violet-800/30">
          <div className="flex items-center justify-center text-center">
            <div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{entries.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
