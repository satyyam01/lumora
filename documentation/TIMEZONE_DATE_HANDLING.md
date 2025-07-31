# Timezone & Date Handling in Lumora

## Overview
Lumora is designed for Indian users, so all date-related operations (saving, querying, displaying) are standardized to Indian Standard Time (IST, UTC+5:30). This ensures consistency across frontend, backend, and database, regardless of server or client timezone.

---

## 1. How Dates Are Stored
- **createdForDate**: Always stored as UTC midnight corresponding to IST midnight for the selected day.
  - Example: For 31 July 2025 (IST), `createdForDate` is stored as `2025-07-30T18:30:00.000Z` (which is 31 July, 00:00 IST).
- **createdAt/updatedAt**: Standard MongoDB timestamps in UTC.

---

## 2. How Dates Are Sent from the Frontend
- When a user selects a date (e.g., 31 July), the frontend uses a helper:
  ```js
  function getISTMidnightUTC(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Subtract one day for UTC, then set 18:30
    const utcDate = new Date(Date.UTC(year, month - 1, day - 1, 18, 30, 0, 0));
    return utcDate.toISOString();
  }
  ```
- This ensures the date is always saved as IST midnight in UTC.

---

## 3. How Dates Are Queried in the Backend
- For any day in IST, the backend calculates the UTC range for that IST day:
  ```js
  // For each IST day:
  const startUTC = dayIST.clone().tz('Asia/Kolkata').startOf('day').utc().toDate();
  const endUTC = dayIST.clone().tz('Asia/Kolkata').endOf('day').utc().toDate();
  // Query:
  JournalEntry.find({
    createdForDate: { $gte: startUTC, $lte: endUTC }
  })
  ```
- This is used for daily queries, weekly trend, streaks, reminders, etc.

---

## 4. How Dates Are Displayed in the Frontend
- All date displays use `date-fns-tz` to convert UTC to IST:
  ```js
  import { utcToZonedTime, format as formatTz } from 'date-fns-tz';
  function formatDateIST(dateString) {
    const istDate = utcToZonedTime(dateString, 'Asia/Kolkata');
    return formatTz(istDate, 'EEEE, d MMMM', { timeZone: 'Asia/Kolkata' });
  }
  ```
- This ensures the user always sees the correct IST day, regardless of their device timezone.

---

## 5. Migration Process for Existing Entries
- A script (`server/scripts/fixEntryDates.js`) updates all existing entries so that `createdForDate` is set to IST midnight in UTC for the date of `createdAt`:
  ```js
  const createdAtIST = moment(entry.createdAt).tz('Asia/Kolkata');
  const istMidnight = createdAtIST.clone().startOf('day');
  const utcForISTMidnight = istMidnight.clone().tz('UTC');
  entry.createdForDate = utcForISTMidnight.toDate();
  ```
- This ensures all historical data is consistent with the new logic.

---

## 6. Why This Matters
- Prevents off-by-one errors and date mismatches between frontend and backend.
- Ensures reminders, streaks, and trends are always accurate for Indian users.
- Robust to server timezone, DST, and user device settings.

---

## 7. References
- [date-fns-tz documentation](https://date-fns.org/v2.30.0/docs/Time-Zones)
- [moment-timezone documentation](https://momentjs.com/timezone/) 