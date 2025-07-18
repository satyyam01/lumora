import { Smile, Meh, Frown, Heart } from "lucide-react";

export default function getMoodIcon(mood) {
  switch (mood?.toLowerCase()) {
    case "positive":
    case "joyful":
    case "happy":
      return <Smile className="w-6 h-6 text-green-500" />
    case "neutral":
    case "calm":
      return <Meh className="w-6 h-6 text-blue-500" />
    case "negative":
    case "sad":
    case "frustrated":
      return <Frown className="w-6 h-6 text-red-500" />
    default:
      return <Heart className="w-6 h-6 text-violet-500" />
  }
} 