"use client"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Sparkles,
  Heart,
  BookOpen,
  Shield,
  Brain,
  TrendingUp,
  MessageCircle,
  Calendar,
  Target,
  Award,
  Zap,
  Lock,
  Cloud,
  Smartphone,
  Globe,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Share2,
} from "lucide-react"

// Enhanced feature data with more details
const coreFeatures = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Advanced AI analyzes your entries to reveal patterns, emotions, and personal growth opportunities.",
    details: [
      "Sentiment analysis with 95% accuracy",
      "Personalized writing prompts",
      "Mood pattern recognition",
      "Growth recommendations",
    ],
    color: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
    darkBgGradient: "from-violet-900/20 to-purple-900/20",
  },
  {
    icon: Heart,
    title: "Mood & Wellness Tracking",
    description: "Track your emotional journey with intelligent mood detection and wellness metrics.",
    details: [
      "Daily mood tracking",
      "Emotional trend analysis",
      "Wellness score calculation",
      "Stress level monitoring",
    ],
    color: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-50",
    darkBgGradient: "from-pink-900/20 to-rose-900/20",
  },
  {
    icon: BookOpen,
    title: "Beautiful Journaling",
    description: "Write in a distraction-free environment with rich formatting and organization tools.",
    details: ["Rich text editor", "Photo & media support", "Smart tagging system", "Search & filter entries"],
    color: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50",
    darkBgGradient: "from-blue-900/20 to-cyan-900/20",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Your thoughts stay yours with end-to-end encryption and complete data ownership.",
    details: ["End-to-end encryption", "Local data storage", "No data selling", "GDPR compliant"],
    color: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    darkBgGradient: "from-emerald-900/20 to-teal-900/20",
  },
]

const advancedFeatures = [
  {
    icon: MessageCircle,
    title: "AI Chat Companion",
    description: "Reflect and explore your thoughts with an intelligent AI companion that understands you.",
    preview: "💬 Chat with AI about your entries",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Visualize your wellness journey with beautiful charts and meaningful insights.",
    preview: "📊 Track your progress over time",
  },
  {
    icon: Target,
    title: "Goal Setting & Tracking",
    description: "Set wellness goals and track your progress with smart reminders and celebrations.",
    preview: "🎯 Achieve your wellness goals",
  },
  {
    icon: Calendar,
    title: "Smart Reminders",
    description: "Gentle, personalized reminders that adapt to your schedule and preferences.",
    preview: "⏰ Never miss a reflection",
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Celebrate milestones with beautiful badges and streak tracking.",
    preview: "🏆 Unlock achievements",
  },
  {
    icon: Zap,
    title: "Quick Capture",
    description: "Instantly capture thoughts with voice notes, photos, or quick text entries.",
    preview: "⚡ Capture thoughts instantly",
  },
]

const integrationFeatures = [
  { icon: Smartphone, title: "Mobile Apps", description: "Native iOS and Android apps" },
  { icon: Cloud, title: "Cloud Sync", description: "Seamless sync across all devices" },
  { icon: Globe, title: "Web Access", description: "Access anywhere with web app" },
  { icon: Lock, title: "Offline Mode", description: "Write even without internet" },
  { icon: Download, title: "Export Data", description: "Export in multiple formats" },
  { icon: Share2, title: "Selective Sharing", description: "Share specific entries safely" },
]

// Interactive demo component
function InteractiveDemo() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const demos = [
    {
      title: "AI Analysis in Action",
      description: "Watch how AI analyzes your journal entry",
      content: (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-violet-200 dark:border-violet-700">
            <p className="text-gray-700 dark:text-gray-300 italic">
              "Today was challenging but I felt grateful for my morning coffee and the sunset..."
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">AI analyzing sentiment...</span>
          </div>
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-violet-500" />
              <span className="font-medium text-violet-700 dark:text-violet-300">AI Insights</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Detected: Mixed emotions with gratitude themes. Stress level: Moderate. Recommended: Gratitude practice.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Mood Tracking",
      description: "See how your mood patterns emerge",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{day}</div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    i === 3 ? "bg-yellow-400" : i === 5 ? "bg-green-400" : i === 1 ? "bg-red-400" : "bg-blue-400"
                  }`}
                >
                  {i === 3 ? "😐" : i === 5 ? "😊" : i === 1 ? "😔" : "😌"}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Weekly Insight:</strong> Your mood improved significantly over the weekend. Consider what
              activities contributed to this positive shift.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Smart Suggestions",
      description: "Get personalized writing prompts",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-violet-200 dark:border-violet-700">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="font-medium text-violet-700 dark:text-violet-300">Today's Prompt</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              "What's one small thing that brought you joy today, and how can you create more moments like this?"
            </p>
            <div className="flex space-x-2">
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
                Use This Prompt
              </Button>
              <Button size="sm" variant="outline" className="border-violet-200 text-violet-600 bg-transparent">
                Get Another
              </Button>
            </div>
          </div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPlaying, demos.length])

  return (
    <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Interactive Demo</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-violet-600 dark:text-violet-400"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDemo(0)}
              className="text-violet-600 dark:text-violet-400"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex space-x-1 mt-4">
          {demos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentDemo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentDemo ? "bg-violet-500 w-8" : "bg-gray-300 dark:bg-gray-600 w-2"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{demos[currentDemo].title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{demos[currentDemo].description}</p>
          </div>
          <div className="min-h-[200px]">{demos[currentDemo].content}</div>
        </div>
      </CardContent>
    </Card>
  )
}

// Feature showcase component
function FeatureShowcase({ feature, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card
      className="group border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} dark:${feature.darkBgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {feature.title}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{feature.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Feature details */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            showDetails || isHovered ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-3 pt-4 border-t border-violet-100/50 dark:border-violet-800/30">
            {feature.details.map((detail, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-in fade-in-0 slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover indicator */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-violet-100/50 dark:border-violet-800/30">
          <Badge
            variant="secondary"
            className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
          >
            Core Feature
          </Badge>
          <div className="flex items-center space-x-1 text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm">Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stats section
function StatsSection() {
  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "1M+", label: "Journal Entries", icon: BookOpen },
    { number: "95%", label: "User Satisfaction", icon: Star },
    { number: "24/7", label: "AI Support", icon: MessageCircle },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
        >
          <CardContent className="p-6">
            <div className="h-4" />
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{stat.number}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function Features() {
  const [activeTab, setActiveTab] = useState("core")

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-blue-50/50 to-indigo-100/50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-violet-200/20 dark:bg-violet-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-1/3 w-28 h-28 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="bg-white/50 backdrop-blur-sm border-violet-200 text-violet-700 dark:text-violet-300"
              >
                ✨ Powerful Features for Mindful Living
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Everything you need
                <br />
                <span className="text-4xl md:text-6xl">for your wellness journey</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Discover powerful tools designed to help you reflect, grow, and find clarity through mindful journaling
                and AI-powered insights.
              </p>
            </div>

            {/* Feature tabs */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: "core", label: "Core Features", icon: Sparkles },
                { id: "advanced", label: "Advanced Tools", icon: Zap },
                { id: "integrations", label: "Integrations", icon: Globe },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                      : "border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent"
                  }
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Core Features */}
          {activeTab === "core" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Core Features</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  The foundation of your mindful journaling experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coreFeatures.map((feature, index) => (
                  <FeatureShowcase key={feature.title} feature={feature} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Advanced Features */}
          {activeTab === "advanced" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Advanced Tools</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Powerful features to enhance your wellness journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advancedFeatures.map((feature, index) => (
                  <Card
                    key={feature.title}
                    className="group border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="h-4" />
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs"
                      >
                        {feature.preview}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === "integrations" && (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Seamless Integration
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Access your journal anywhere, anytime, on any device
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {integrationFeatures.map((feature, index) => (
                  <Card
                    key={feature.title}
                    className="group border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
                  >
                    <CardContent className="p-6">
                      <div className="h-4" />
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Demo Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                See Lumora in Action
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience how our AI-powered features work to enhance your journaling
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <InteractiveDemo />
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join a growing community of mindful writers and wellness enthusiasts
              </p>
            </div>

            <StatsSection />
          </div>

          {/* Call to Action */}
          <Card className="border-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-md shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center relative">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 bg-violet-300/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
                  Ready to start your wellness journey?
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Join thousands who have found clarity and peace through mindful journaling with Lumora's powerful
                  features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 rounded-2xl border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 bg-transparent backdrop-blur-sm"
                  >
                    View Pricing
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No credit card required • Free forever plan • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
