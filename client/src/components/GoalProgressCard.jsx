"use client"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Target,
  Trophy,
  Calendar,
  Star,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bell,
} from "lucide-react"
import GoalModal from "./GoalModal"
import useGoal from "../hooks/useGoal"

export default function GoalProgressCard() {
  const { goal, loading, error, cancelGoal, refetch } = useGoal()

  // Defensive: log the goal object for debugging
  console.log('GoalProgressCard goal:', goal)

  // Defensive defaults
  const safeGoal = goal || {}
  const progress = typeof safeGoal.progress === 'number' ? safeGoal.progress : 0
  const targetDays = typeof safeGoal.targetDays === 'number' ? safeGoal.targetDays : 1
  const startDate = safeGoal.startDate ? new Date(safeGoal.startDate) : new Date()
  const endDate = safeGoal.endDate ? new Date(safeGoal.endDate) : new Date()
  const remainingDays = typeof safeGoal.remainingDays === 'number' ? safeGoal.remainingDays : Math.max(0, targetDays - progress)

  const handleCancelGoal = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your current goal? This action cannot be undone."
    )
    if (confirmed) {
      await cancelGoal()
    }
  }

  // Patch getProgressPercentage and formatDate to use safe values
  const getProgressPercentage = () => {
    return Math.min(100, (progress / targetDays) * 100)
  }

  const getGoalStatus = () => {
    if (!goal) return null
    
    if (goal.isCompleted) {
      return {
        text: "Completed!",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-800",
        icon: CheckCircle2
      }
    }
    
    if (goal.isExpired) {
      return {
        text: "Expired",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-800",
        icon: AlertCircle
      }
    }
    
    return {
      text: "In Progress",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      icon: Clock
    }
  }

  const formatDate = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A'
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">Error loading goal data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!goal) {
    return (
      <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              No Active Goal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Set a journaling goal to stay motivated and track your progress
            </p>
            <GoalModal 
              onSuccess={refetch}
              trigger={
                <Button className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600">
                  <Target className="w-4 h-4 mr-2" />
                  Set a Goal
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = getGoalStatus()

  return (
    <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-gray-800 dark:text-gray-200">Journaling Goal</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {targetDays} day challenge
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${status.bgColor} ${status.borderColor} ${status.color}`}
          >
            <status.icon className="w-3 h-3 mr-1" />
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {progress} / {targetDays} days
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-violet-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {remainingDays > 0 
              ? `${remainingDays} days remaining`
              : "Goal completed!"
            }
          </div>
        </div>

        {/* Goal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-gray-600 dark:text-gray-400">Started</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {formatDate(startDate)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-gray-600 dark:text-gray-400">Ends</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {formatDate(endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Reminder Info */}
        <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Bell className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Daily reminders sent at {goal.reminderTime || "09:00"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!goal.isCompleted && !goal.isExpired && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelGoal}
              className="flex-1 border-red-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Goal
            </Button>
          )}
          {(goal.isCompleted || goal.isExpired) && (
            <GoalModal 
              onSuccess={refetch}
              trigger={
                <Button className="flex-1 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600">
                  <Target className="w-4 h-4 mr-2" />
                  Set New Goal
                </Button>
              }
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
} 