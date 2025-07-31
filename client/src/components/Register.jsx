import { useState, useRef } from "react"
import AuthForm from "./AuthForm"

export default function Register() {
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [pendingEmail, setPendingEmail] = useState("")
  const [pendingPassword, setPendingPassword] = useState("")
  const [pendingName, setPendingName] = useState("")
  const [pendingDob, setPendingDob] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  // Step 1: Request OTP
  const handleRequestOtp = async ({ email, password, name, dob }) => {
    setError("")
    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, dob }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send OTP")
      setPendingEmail(email)
      setPendingPassword(password)
      setPendingName(name)
      setPendingDob(dob)
      setStep(2)
      startResendTimer()
    } catch (err) {
      setError(err.message)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async ({ otp }) => {
    setError("")
    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "OTP verification failed")
      localStorage.setItem("token", data.token)
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message)
    }
  }

  // Resend OTP logic
  const handleResendOtp = async () => {
    setError("")
    try {
      const res = await fetch("http://localhost:3000/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, password: pendingPassword, name: pendingName, dob: pendingDob }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP")
      startResendTimer()
    } catch (err) {
      setError(err.message)
    }
  }

  // Timer logic
  const startResendTimer = () => {
    setResendTimer(30)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <AuthForm
      mode="register"
      step={step}
      onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}
      error={error}
      pendingEmail={pendingEmail}
      onResendOtp={handleResendOtp}
      resendTimer={resendTimer}
    />
  )
} 