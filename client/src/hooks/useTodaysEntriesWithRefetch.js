import { useState, useEffect, useCallback } from "react";

export default function useTodaysEntriesWithRefetch() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3000/api/journals/today", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
} 