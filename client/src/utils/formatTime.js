import { utcToZonedTime, format as formatTz } from 'date-fns-tz';

export default function formatTime(dateString) {
  const istDate = utcToZonedTime(dateString, 'Asia/Kolkata');
  return formatTz(istDate, 'HH:mm', { timeZone: 'Asia/Kolkata' });
} 