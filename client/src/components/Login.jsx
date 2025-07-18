import { useState } from "react";
import AuthForm from "./AuthForm";

export default function Login() {
  const [error, setError] = useState("")

  const handleLogin = async ({ email, password }) => {
    setError("")
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")
      localStorage.setItem("token", data.token)
      window.location.href = "/dashboard"
    } catch (err) {
      setError(err.message)
    }
  }

  return <AuthForm mode="login" onSubmit={handleLogin} error={error} />
} 