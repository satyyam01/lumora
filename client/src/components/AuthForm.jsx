"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { Sparkles, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"

export default function AuthForm({ mode, onSubmit, error, step = 1, pendingEmail = "", onResendOtp, resendTimer = 0 }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (mode === "register" && step === 2) {
        await onSubmit({ otp })
      } else if (mode === "register" && step === 1) {
        await onSubmit({ email, password, name, dob })
      } else {
        await onSubmit({ email, password })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isLogin = mode === "login"
  const isRegister = mode === "register"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-violet-200/30 dark:bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-indigo-200/30 dark:bg-indigo-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Lumora
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isLogin ? "Welcome back to your wellness journey" : "Start your mindful journey today"}
            </p>
          </div>

          {/* Auth Card */}
          <Card className="border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                {isLogin ? "Sign In" : step === 2 ? "Verify OTP" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                {isLogin
                  ? "Enter your credentials to access your journal"
                  : step === 2
                  ? `Enter the 6-digit code sent to ${pendingEmail}`
                  : "Join thousands finding clarity through mindful journaling"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name and DOB Fields (Register Step 1) */}
                {isRegister && step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200"
                      />
                    </div>
                  </>
                )}
                {/* Email/Password Fields (Step 1) */}
                {!(isRegister && step === 2) && (
                  <>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                    </div>
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10 h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {/* OTP Field (Step 2) */}
                {isRegister && step === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        6-digit OTP Code
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                        className="h-12 bg-white/50 dark:bg-gray-700/50 border-violet-200 dark:border-violet-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-violet-400/20 backdrop-blur-sm transition-all duration-200 tracking-widest text-lg text-center font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Didn't receive the code?
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onResendOtp}
                        disabled={resendTimer > 0}
                        className="ml-2 px-3 py-1 text-xs font-medium border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-60"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                      </Button>
                    </div>
                  </>
                )}
                {/* Error Message */}
                {error && (
                  <Alert className="border-red-200 bg-red-50/50 dark:bg-red-900/20 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                  </Alert>
                )}
                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isLogin ? "Signing In..." : step === 2 ? "Verifying..." : "Creating Account..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{isLogin ? "Sign In" : step === 2 ? "Verify OTP" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-violet-200 dark:border-violet-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/60 dark:bg-gray-800/60 px-2 text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                    {isLogin ? "New to Lumora?" : "Already have an account?"}
                  </span>
                </div>
              </div>

              {/* Switch Mode Link */}
              <div className="text-center">
                <Link
                  to={isLogin ? "/register" : "/login"}
                  className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors duration-200 hover:underline"
                >
                  {isLogin ? "Create a free account" : "Sign in to your account"}
                </Link>
              </div>

              {/* Additional Info for Register */}
              {isRegister && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Features */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isLogin ? "Secure sign-in with end-to-end encryption" : "Join thousands on their wellness journey"}
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Private & Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AI-Powered</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span>Free Forever</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
