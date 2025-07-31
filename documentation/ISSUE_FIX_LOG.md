# Lumora Issue & Fix Log (Session)

## Overview
This document tracks all major issues encountered and resolved during the timezone, date, and journaling feature upgrades, including technical context and solutions.

---

### 1. Date Selector & Schema Separation
- **Issue:** Needed to allow users to select a date for journal entries, separating `createdAt` (timestamp) and `createdForDate` (user-selected day).
- **Fix:** Added `createdForDate` to schema. Frontend sends selected date as IST midnight in UTC.

---

### 2. Off-by-One Date Bug (31st July shows as 1st August)
- **Issue:** Entries for 31st July (IST) appeared as 1st August due to UTC/IST conversion error.
- **Fix:** Patched frontend to use a helper that sets `createdForDate` to UTC midnight for IST day (`2025-07-30T18:30:00.000Z` for 31 July). Updated backend and frontend display logic to always use IST.

---

### 3. Weekly Trend Chart Not Picking Up Entries
- **Issue:** Weekly trend chart missed entries for some days due to timezone mismatch in backend query.
- **Fix:** Backend now generates UTC range for each IST day using moment-timezone, ensuring all entries for the IST day are included.

---

### 4. Inconsistent Date Display Across App
- **Issue:** Some components used local time, others used UTC, causing inconsistent date display.
- **Fix:** Standardized all frontend date displays to use `date-fns-tz` and always show IST.

---

### 5. Reminder & Streak Logic
- **Issue:** Reminders and streaks were sometimes off by a day due to timezone confusion.
- **Fix:** All backend logic for reminders, streaks, and trends now uses IST day boundaries, calculated in UTC.

---

### 6. Migration for Existing Data
- **Issue:** Old entries had `createdForDate` set incorrectly (local time or UTC midnight).
- **Fix:** Wrote and ran a migration script to update all entries so `createdForDate` is always IST midnight in UTC for the date of `createdAt`.

---

### 7. Environment Variable & Email Issues
- **Issue:** Email service and scripts sometimes failed due to missing or hardcoded environment variables.
- **Fix:** Updated all scripts and services to use `process.env.MONGO_URI` and dynamic transporter creation for email.

---

### 8. Frontend Build/Import Errors
- **Issue:** Import errors for `date-fns-tz` due to missing or incompatible versions.
- **Fix:** Installed compatible versions of `date-fns` and `date-fns-tz` in the client, and updated all imports to use named ESM exports.

---

### 9. General Robustness
- **Issue:** Subtle bugs due to server timezone, DST, or user device settings.
- **Fix:** All date logic is now robust to server/client timezone, DST, and always uses IST as the canonical day.

---

## References
- See `TIMEZONE_DATE_HANDLING.md` for technical details and code samples. 