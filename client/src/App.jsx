"use client"
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom"
import Layout from "./components/Layout"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Alert, AlertDescription } from "./components/ui/alert"
import AuthForm from "./components/AuthForm"
import ProtectedRoute from "./components/ProtectedRoute"
import LumoraHomepage from "./components/LumoraHomepage"
import {
  BookOpen,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  Brain,
  Edit3,
  Trash2,
  Save,
  ArrowLeft,
  Smile,
  Meh,
  Frown,
  Loader2,
  AlertCircle,
  PenTool,
} from "lucide-react"
import { useState, useEffect } from "react"
import useTodaysEntries from "./hooks/useTodaysEntries"
import useTodaysEntriesWithRefetch from "./hooks/useTodaysEntriesWithRefetch"
import useTodayMood from "./hooks/useTodayMood"
import useWeeklySentimentTrend from "./hooks/useWeeklySentimentTrend"
import LoadingSpinner from "./components/LoadingSpinner"
import EmptyState from "./components/EmptyState"
import formatDate from "./utils/formatDate"
import formatTime from "./utils/formatTime"
import getMoodIcon from "./utils/getMoodIcon.jsx"
import getSentimentColor from "./utils/getSentimentColor"
import JournalList from "./components/JournalList"
import EntryEditor from "./components/EntryEditor"
import Home from "./components/Home"
import Register from "./components/Register"
import Login from "./components/Login"
import ChatPage from "./components/ChatPage"
import Features from "./components/Features";
import WeeklyTrend from "./components/WeeklyTrend";
import ProfilePage from "./components/ProfilePage";

// Utility Functions

// Components
function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page: no Layout */}
        <Route path="/" element={<LumoraHomepage />} />

        {/* App shell: Layout wraps these routes */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                {/* ChatPage will be created in src/pages/ChatPage.jsx */}
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route path="/features" element={<Features />} />
          <Route
            path="/weekly-trend"
            element={
              <ProtectedRoute>
                <WeeklyTrend />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
