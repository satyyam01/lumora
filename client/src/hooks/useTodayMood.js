import { useState, useEffect, useCallback } from "react";

export default function useTodayMood() {
  const [data, setData] = useState({ mood: null, sentiment: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/journals/stats/today-mood", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
} 