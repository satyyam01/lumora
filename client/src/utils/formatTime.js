export default function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
} 