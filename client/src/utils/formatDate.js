import { utcToZonedTime, format as formatTz } from 'date-fns-tz';

export default function formatDate(dateString) {
  const istDate = utcToZonedTime(dateString, 'Asia/Kolkata');
  return formatTz(istDate, 'EEEE, d MMMM', { timeZone: 'Asia/Kolkata' });
} 