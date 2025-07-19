import { useState, useEffect, useCallback } from "react";

export default function useStreakData() {
  const [data, setData] = useState({ current: 0, longest: 0, thisWeek: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No authentication token")
        setLoading(false)
        return
      }
      const res = await fetch("http://localhost:3000/api/journals/stats/streak", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error("Error fetching streak data:", err)
      setError(err.message)
      // Don't reset data on error, keep previous data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, error, refetch: fetchData }
} 