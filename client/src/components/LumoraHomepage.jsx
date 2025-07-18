"use client"

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  Sparkles,
  Heart,
  BookOpen,
  Shield,
  PenTool,
  Brain,
  TrendingUp,
  ArrowRight,
  Star,
  Github,
  Twitter,
  Mail,
  Menu,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

export default function LumoraHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const handleSignIn = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Summaries & Insights",
      description: "Get personalized insights and patterns from your journal entries with advanced AI analysis.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Track Your Mood & Sentiment",
      description: "Understand your emotional journey with intelligent mood tracking and sentiment analysis.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Daily Logs & Reflections",
      description: "Create beautiful, organized entries with guided prompts and reflection exercises.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Private, Secure, Beautiful",
      description: "Your thoughts stay yours. End-to-end encryption with a delightful user experience.",
    },
  ]

  const steps = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Write",
      description: "Express your thoughts freely with our intuitive journaling interface",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Reflect",
      description: "AI analyzes your entries to reveal patterns and insights about your wellbeing",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Grow",
      description: "Use personalized recommendations to build better habits and mental clarity",
    },
  ]

  const testimonials = [
    {
      quote:
        "Lumora has transformed how I understand my emotions. The AI insights are incredibly helpful without feeling invasive.",
      name: "Sarah Chen",
      role: "Product Designer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote: "Finally, a journaling app that feels like it truly understands me. The mood tracking is spot-on.",
      name: "Marcus Rodriguez",
      role: "Therapist",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote: "The daily reflections have become my favorite part of the morning routine. Simple yet profound.",
      name: "Emma Thompson",
      role: "Writer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-50 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Lumora
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-gray-600 hover:text-violet-600 transition-colors">
              Features
            </Link>
            <Link to="#how-it-works" className="text-gray-600 hover:text-violet-600 transition-colors">
              How it Works
            </Link>
            <Link to="#testimonials" className="text-gray-600 hover:text-violet-600 transition-colors">
              Testimonials
            </Link>
            {!isLoggedIn ? (
              <>
                <Button variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50 bg-transparent" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </>
            ) : (
              <Button className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating elements for visual interest */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-violet-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>

          <Badge variant="secondary" className="mb-6 bg-white/50 backdrop-blur-sm border-violet-200">
            ✨ AI-Powered Wellness Journey
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Shine a Light on Your Mind
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Lumora helps you reflect, grow, and find clarity with AI-powered journaling. Transform your thoughts into
            insights and build lasting wellness habits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isLoggedIn ? (
              <>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full border-violet-200 text-violet-600 hover:bg-violet-50 backdrop-blur-sm bg-white/50"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-6">No credit card required • Your data stays yours • Free forever</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Everything you need for mindful growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you understand yourself better and build lasting wellness habits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              >
                <CardContent className="p-8">
                  <div className='h-6' />
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Your journey to clarity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your thoughts into meaningful insights and lasting growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-violet-300 to-blue-300 transform translate-x-6"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Loved by thousands
            </h2>
            <p className="text-xl text-gray-600">See how Lumora is helping people find clarity and peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className='h-6' />
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-800">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-violet-500 via-blue-500 to-indigo-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Start your wellness journey today</h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join thousands who have found clarity and peace through mindful journaling. No credit card required. Your
            data stays yours.
          </p>
          <Button
            size="lg"
            className="bg-white text-violet-600 hover:bg-gray-50 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-white/50 backdrop-blur-sm border-t border-violet-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Lumora
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end items-center space-x-8 text-sm text-gray-600">
              <Link to="/about" className="hover:text-violet-600 transition-colors">
                About
              </Link>
              <Link to="/privacy" className="hover:text-violet-600 transition-colors">
                Privacy
              </Link>
              <Link to="/contact" className="hover:text-violet-600 transition-colors">
                Contact
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="#" className="hover:text-violet-600 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link to="#" className="hover:text-violet-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link to="#" className="hover:text-violet-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-violet-100 text-center text-sm text-gray-500">
            © 2024 Lumora. All rights reserved. Made with ❤️ for your wellbeing.
          </div>
        </div>
      </footer>
    </div>
  )
}
