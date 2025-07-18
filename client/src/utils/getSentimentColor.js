export default function getSentimentColor(sentiment) {
  const colors = {
    positive: "bg-green-500",
    neutral: "bg-blue-500",
    negative: "bg-red-500",
    anxious: "bg-yellow-500",
    hopeful: "bg-cyan-500",
    frustrated: "bg-red-500",
    grateful: "bg-emerald-500",
    sad: "bg-indigo-500",
    joyful: "bg-pink-500",
    unknown: "bg-gray-500",
  }
  return colors[sentiment] || colors.unknown
} 