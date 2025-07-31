import { useState, useEffect, useCallback } from "react";

export default function useGoal() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:3000/api/goals/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      setGoal(json.goal);
    } catch (err) {
      console.error("Error fetching goal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setNewGoal = useCallback(async (targetDays) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:3000/api/goals/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetDays }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to set goal");
      }
      const json = await res.json();
      setGoal(json.goal);
      return json;
    } catch (err) {
      console.error("Error setting goal:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelGoal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:3000/api/goals/cancel", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setGoal(null);
    } catch (err) {
      console.error("Error cancelling goal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReminderSettings = useCallback(async (reminderTime, reminderEnabled) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        setLoading(false);
        return;
      }
      const res = await fetch("http://localhost:3000/api/goals/reminder-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reminderTime, reminderEnabled }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update reminder settings");
      }
      const data = await res.json();
      // Update the goal state with new reminder settings
      if (goal) {
        setGoal({
          ...goal,
          reminderTime: data.reminderSettings.reminderTime,
          reminderEnabled: data.reminderSettings.reminderEnabled
        });
      }
      return data;
    } catch (err) {
      console.error("Error updating reminder settings:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [goal]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return { 
    goal, 
    loading, 
    error, 
    setNewGoal, 
    cancelGoal, 
    updateReminderSettings,
    refetch: fetchGoal 
  };
} 