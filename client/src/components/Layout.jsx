"use client"

import { useState } from "react"
import { Link, useNavigate, Outlet } from "react-router-dom"
import { Button } from "./ui/button"
import { ThemeProvider, ThemeSwitcher } from "./ThemeProvider"
import { Sparkles, Menu, X, MessageCircle, BookOpen, Home } from "lucide-react"
import Footer from "./Footer"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isLoggedIn = !!localStorage.getItem("token")
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg border-b border-violet-100 dark:border-violet-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Lumora
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 group"
              >
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 group"
              >
                <Link to="/journals" className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Journals</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 group"
              >
                <Link to="/chat" className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">My Chats</span>
                </Link>
              </Button>
            </>
          )}
          <ThemeSwitcher />
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent backdrop-blur-sm"
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent backdrop-blur-sm"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-violet-600 dark:text-violet-400"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-violet-100 dark:border-violet-800/50 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {isLoggedIn ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 justify-start"
                >
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 justify-start"
                >
                  <Link to="/journals" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Journals</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 justify-start"
                >
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">My Chats</span>
                  </Link>
                </Button>
                <div className="border-t border-violet-100 dark:border-violet-800/50 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
                >
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                >
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

import { useLocation } from "react-router-dom"

export default function Layout() {
  const location = useLocation()
  const isChatPage = location.pathname === "/chat"
  
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <Navbar />
        {/* Main Content Area */}
        <main className={`flex-1 ${isChatPage ? 'pt-0 pb-0' : 'pt-24 pb-12'}`}>
          <Outlet />
        </main>
        {!isChatPage && <Footer />}
      </div>
    </ThemeProvider>
  )
}
