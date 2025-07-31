"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { PenTool, Sparkles, Save, X, BookOpen, Calendar, AlertCircle, Loader2, Plus } from "lucide-react"

// Helper to get midnight IST in UTC for a given YYYY-MM-DD string
function getISTMidnightUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Subtract one day for UTC, then set 18:30
  const utcDate = new Date(Date.UTC(year, month - 1, day - 1, 18, 30, 0, 0));
  return utcDate.toISOString();
}

export default function JournalEntryModal({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          content, 
          createdForDate: getISTMidnightUTC(selectedDate)
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to create entry")

      // Success - close modal and reset form
      setOpen(false)
      setTitle("")
      setContent("")
      setSelectedDate(() => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setError("")
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Entry
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl p-0">
        {/* Floating background elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-violet-200/30 dark:bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Header */}
        <DialogHeader className="relative p-8 pb-6 border-b border-violet-100/50 dark:border-violet-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  New Journal Entry
                </DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedDateFormatted}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="relative p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selector */}
            <div className="space-y-3">
              <Label
                htmlFor="date"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Entry Date</span>
              </Label>
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
                className="h-12 bg-white/50 dark:bg-gray-800/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200 text-lg"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Choose the date this entry is for (cannot be in the future)
              </div>
            </div>

            {/* Spacer above Entry Title */}
            <div className="h-5" />
            {/* Title Field */}
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Entry Title</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="What's on your mind today?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12 bg-white/50 dark:bg-gray-800/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200 text-lg"
              />
            </div>

            {/* Content Field */}
            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Your Thoughts</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Pour your heart out... Share your thoughts, feelings, experiences, or reflections. This is your safe space to express yourself freely."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="min-h-[200px] resize-none bg-white/50 dark:bg-gray-800/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200 text-base leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Express yourself freely - your thoughts are private and secure</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Private
                </Badge>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="relative p-8 pt-6 border-t border-violet-100/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-900/20 dark:to-blue-900/20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent backdrop-blur-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !title.trim() || !content.trim()}
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
                  <span>Save Entry</span>
                </div>
              )}
            </Button>
          </div>

          {/* Helpful tip */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            💡 Tip: Regular journaling can improve mental clarity and emotional wellbeing
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
