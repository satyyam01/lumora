"use client"
import { useEffect, useState, useRef } from "react"
import React from "react"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Alert, AlertDescription } from "./ui/alert"
import {
  fetchChatSessions,
  createChatSession,
  fetchSessionMessages,
  sendMessageToSession,
  deleteChatSession as apiDeleteChatSession,
} from "../api/chat"
import { useLocation, useNavigate } from "react-router-dom"
import {
  MessageCircle,
  Plus,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  Brain,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Menu,
} from "lucide-react"

// ErrorBoundary for global error catching
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught: ", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</div>
          <div className="text-red-500 dark:text-red-300 text-center max-w-md">
            {this.state.error?.message || String(this.state.error)}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const LoadingSpinner = ({ size = "default" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-violet-500`} />
      <span className="text-gray-600 dark:text-gray-400">Loading...</span>
    </div>
  )
}

const SessionSidebar = ({
  sessions,
  loading,
  error,
  creating,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose,
}) => (
  <>
    {/* Mobile Overlay */}
    {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={onClose} />}

    {/* Sidebar */}
    <aside
      className={`fixed md:relative top-0 left-0 h-full w-80 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-r border-violet-100/50 dark:border-violet-800/30 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Chats
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your reflection companion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={onNewSession}
          disabled={creating}
          className="w-full mb-6 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          {creating ? "Creating..." : "New Chat"}
        </Button>

        {/* Sessions List */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Recent Conversations</span>
          </h3>

          <div className="overflow-y-auto h-full pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            ) : !Array.isArray(sessions) || sessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-violet-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start your first chat above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session?._id || session?.id || Math.random()}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      activeSessionId === session._id
                        ? "bg-gradient-to-r from-violet-100 to-blue-100 dark:from-violet-900/40 dark:to-blue-900/40 border border-violet-200 dark:border-violet-700 shadow-md"
                        : "bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-transparent hover:border-violet-200 dark:hover:border-violet-700"
                    }`}
                    onClick={() => onSelectSession(session._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                          {session?.title?.trim() ? session.title : "Untitled Chat"}
                        </h4>
                        {session.entry && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                          >
                            Entry: {session.entry.title || "Untitled"}
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 w-8 h-8 flex-shrink-0 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSession && onDeleteSession(session._id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  </>
)

const ChatMainArea = ({
  sessionId,
  entryTitle,
  onFirstMessage,
  pendingEntryChat,
  chatMessages,
  setChatMessages,
  onToggleSidebar,
}) => {
  const [messages, setMessagesState] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)

  // Use parent state if provided
  const setMessages = setChatMessages || setMessagesState
  const messagesToShow = chatMessages !== undefined ? chatMessages : messages

  useEffect(() => {
    if (!sessionId || pendingEntryChat) return

    setIsTransitioning(true)
    setLoading(true)
    setError(null)

    fetchSessionMessages(sessionId)
      .then((data) => {
        const newMessages = Array.isArray(data?.session?.messages)
          ? data.session.messages
          : Array.isArray(data?.messages)
            ? data.messages
            : []
        setMessages(newMessages)
      })
      .catch((err) => {
        setError(err.message || "Failed to load messages")
      })
      .finally(() => {
        setLoading(false)
        setTimeout(() => setIsTransitioning(false), 100)
      })
  }, [sessionId, pendingEntryChat])

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current && messagesToShow.length > 0) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messagesToShow])

  // Focus input when session changes
  useEffect(() => {
    if ((sessionId || pendingEntryChat) && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [sessionId, pendingEntryChat])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setSending(true)
    setError(null)

    try {
      if (pendingEntryChat && onFirstMessage) {
        await onFirstMessage(input.trim(), setMessages)
        setInput("")
      } else if (sessionId) {
        setMessages((prev) => [...prev, { role: "user", content: input }])
        setInput("")
        const res = await sendMessageToSession(sessionId, input.trim())
        setMessages(res.messages || [])
      }
    } catch (err) {
      setError(err.message || "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const EmptyState = ({ title, description, showInput = false }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-violet-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">{description}</p>
      {showInput && (
        <div className="text-sm text-violet-600 dark:text-violet-400 font-medium">
          Type your message below to start the conversation
        </div>
      )}
    </div>
  )

  return (
    <main className="flex-1 flex flex-col h-full max-h-screen overflow-hidden sticky top-0">
      {/* Header */}
              <div className="flex items-center justify-between p-4 relative z-10">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

        {entryTitle && (
          <Badge
            variant="secondary"
            className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700"
          >
            Discussing: {entryTitle}
          </Badge>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-violet-50/30 via-blue-50/30 to-indigo-100/30 dark:from-gray-900/30 dark:via-gray-800/30 dark:to-gray-900/30 pt-0">
        <div
          ref={chatContainerRef}
          className={`flex-1 overflow-y-auto p-4 transition-all duration-200 ease-in-out max-h-[calc(100vh-200px)] ${
            isTransitioning ? "opacity-70" : "opacity-100"
          }`}
        >
          {!sessionId && !pendingEntryChat ? (
            <EmptyState
              title="Hi! I'm Lumora"
              description="This is a safe space, you can pour your heart out here."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading your conversation...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <Alert className="max-w-md border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            </div>
          ) : (!Array.isArray(messagesToShow) || messagesToShow.length === 0) && !loading ? (
            <EmptyState
              title="Start the conversation"
              description="Share your thoughts, ask questions, or reflect on your journal entries. I'm here to help you on your wellness journey."
              showInput={true}
            />
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messagesToShow.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-violet-500 to-blue-500"
                          : "bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-700"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-violet-500" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white border-violet-300"
                          : "bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border-violet-100 dark:border-violet-800"
                      }`}
                    >
                      <div className="whitespace-pre-line break-words leading-relaxed">{msg.content}</div>

                      {/* Message timestamp */}
                      <div
                        className={`text-xs mt-2 ${
                          msg.role === "user" ? "text-violet-100" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator when sending */}
              {sending && (
                <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-700">
                      <Bot className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border border-violet-100 dark:border-violet-800 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        {(sessionId || pendingEntryChat) && (
          <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t border-violet-100/50 dark:border-violet-800/30">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Share your thoughts or ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                    className="pr-12 h-12 bg-white/80 dark:bg-gray-900/80 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend(e)
                      }
                    }}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    Enter to send
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}

const ChatPage = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [entryTitle, setEntryTitle] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [pendingEntryChat, setPendingEntryChat] = useState(false)
  const [pendingGlobalChat, setPendingGlobalChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])

  // Parse sessionId and entryId from query params
  const { sessionId: urlSessionId, entryId: urlEntryId } = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      sessionId: params.get("sessionId"),
      entryId: params.get("entryId"),
    }
  }, [location.search])

  // On mount, restore sessionId from URL if present
  useEffect(() => {
    if (urlSessionId && urlSessionId !== activeSessionId) {
      setActiveSessionId(urlSessionId)
    }
  }, [urlSessionId])

  // Use entryId from URL if no sessionId
  const entryId = urlSessionId ? null : urlEntryId

  // If entryId is present, fetch entry title for display
  useEffect(() => {
    if (!entryId) {
      setEntryTitle("")
      return
    }

    const fetchEntry = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/journals/${entryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.title) setEntryTitle(data.title)
        else setEntryTitle("(Entry)")
      } catch {
        setEntryTitle("(Entry)")
      }
    }
    fetchEntry()
  }, [entryId])

  async function loadSessions(selectId) {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchChatSessions()
      setSessions(Array.isArray(data.sessions) ? data.sessions : Array.isArray(data) ? data : [])
      if (selectId) setActiveSessionId(selectId)
    } catch (err) {
      setError(err.message || "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (entryId && !activeSessionId) {
      setPendingEntryChat(true)
    } else {
      setPendingEntryChat(false)
    }
  }, [entryId, activeSessionId])

  useEffect(() => {
    if (!entryId && !activeSessionId && pendingGlobalChat) {
      setPendingGlobalChat(true)
    } else if (activeSessionId) {
      setPendingGlobalChat(false)
    }
  }, [entryId, activeSessionId, pendingGlobalChat])

  const handleNewSession = () => {
    setPendingGlobalChat(true)
    setActiveSessionId(null)
    setChatMessages([])
    setEntryTitle("")
    navigate("/chat")
    setSidebarOpen(false)
  }

  const handleSelectSession = async (sessionId) => {
    setActiveSessionId(sessionId)
    navigate(`/chat?sessionId=${sessionId}`)
    const session = sessions.find((s) => s._id === sessionId)
    if (session && session.entry) {
      setEntryTitle(session.entry.title || "(Entry)")
    } else {
      setEntryTitle("")
    }
    setSidebarOpen(false)
  }

  const handleFirstMessage = async (firstMessage, setMessages) => {
    setCreating(true)
    try {
      const newSession = await createChatSession(firstMessage, entryId)
      setActiveSessionId(newSession.sessionId)
      setPendingEntryChat(false)
      setPendingGlobalChat(false)
      setMessages([
        { role: "user", content: firstMessage },
        { role: "ai", content: newSession.answer },
      ])
      if (newSession.entry) {
        setEntryTitle(newSession.entry.title || "(Entry)")
      }
      await loadSessions(newSession.sessionId)
    } catch (err) {
      setError(err.message || "Failed to create session")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return
    }

    try {
      await apiDeleteChatSession(sessionId)
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setChatMessages([])
        setEntryTitle("")
      }
      await loadSessions()
    } catch (err) {
      setError(err.message || "Failed to delete session")
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen pt-16 bg-gradient-to-br from-violet-50/50 via-blue-50/50 to-indigo-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50">
        <SessionSidebar
          sessions={sessions}
          loading={loading}
          error={error}
          creating={creating}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ChatMainArea
          sessionId={activeSessionId}
          entryTitle={entryTitle}
          onFirstMessage={handleFirstMessage}
          pendingEntryChat={pendingEntryChat || pendingGlobalChat}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </ErrorBoundary>
  )
}

export default ChatPage
