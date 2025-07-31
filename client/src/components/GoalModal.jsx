"use client"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Target,
  Calendar,
  Trophy,
  Star,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Bell,
} from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export default function GoalModal({ onSuccess, trigger }) {
  const [open, setOpen] = useState(false)
  const [targetDays, setTargetDays] = useState(7)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/goals/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          targetDays, 
          reminderTime, 
          reminderEnabled 
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to set goal")

      // Success - close modal and reset form
      setOpen(false)
      setTargetDays(7)
      setReminderTime("09:00")
      setReminderEnabled(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setError("")
  }

  const calculateEndDate = () => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + targetDays - 1)
    return endDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Generate hour options
  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    (i < 10 ? `0${i}` : `${i}`) + ":00"
  )

  const reminderTimeOptions = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl p-0">
        {/* Floating background elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-violet-200/30 dark:bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        {/* Header */}
        <DialogHeader className="relative p-8 pb-6 border-b border-violet-100/50 dark:border-violet-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Set Your Goal
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Challenge yourself to journal consistently
                </p>
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
        <div className="relative p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Preview */}
            <Card className="border-0 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {targetDays} Day Challenge
                    </h3>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Ends: {calculateEndDate()}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <Bell className="w-3 h-3 mr-1" />
                      Daily Reminders at {reminderTime}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Days Input */}
            <div className="space-y-3">
              <Label
                htmlFor="targetDays"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <span>Number of Days</span>
              </Label>
              <Input
                id="targetDays"
                type="number"
                min="1"
                max="365"
                value={targetDays}
                onChange={(e) => setTargetDays(parseInt(e.target.value) || 1)}
                className="h-12 bg-white/50 dark:bg-gray-800/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200 text-lg"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Choose between 1 and 365 days
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {[7, 14, 21, 30, 60, 90].map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={targetDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTargetDays(days)}
                    className={targetDays === days 
                      ? "bg-violet-500 text-white hover:bg-violet-600" 
                      : "border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Reminder Settings</span>
              </Label>
              
              <div className="space-y-4">
                {/* Reminder Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reminderEnabled"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 dark:focus:ring-violet-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label htmlFor="reminderEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                      Enable daily reminders
                    </Label>
                  </div>
                </div>

                {/* Reminder Time (hourly only) */}
                {reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminderTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reminder Time
                    </Label>
                    <select
                      id="reminderTime"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                    >
                      {reminderTimeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Reminders will be sent at 30-minute intervals</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="relative p-8 pt-6 border-t border-violet-100/50 dark:border-violet-800/30 bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-900/20 dark:to-blue-900/20 backdrop-blur-sm">
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
              disabled={loading || targetDays < 1 || targetDays > 365}
              className="flex-1 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              Set Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 