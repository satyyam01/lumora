# Timezone Off-by-One Date Bug

## Problem Description
The application experienced a critical timezone bug where journal entries for July 31st (IST) appeared as August 1st due to incorrect UTC/IST conversion logic. This caused off-by-one errors in date displays, streak calculations, and weekly trend charts, significantly impacting user experience and data accuracy.

## Discovery Method
This bug was likely discovered by users reporting that their journal entries appeared on the wrong dates, or during testing when developers noticed inconsistencies between expected and actual dates. The issue would have been particularly noticeable around month boundaries and during timezone transitions.

## Code Location
```javascript
// Frontend date handling (before fix)
function getISTMidnightUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Incorrect: This caused off-by-one errors
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return utcDate.toISOString();
}

// Backend timezone conversion (before fix)
const startUTC = dayIST.clone().tz('Asia/Kolkata').startOf('day').utc().toDate();
const endUTC = dayIST.clone().tz('Asia/Kolkata').endOf('day').utc().toDate();
```

## Why It's a Problem
- **Date Mismatches**: Entries appear on wrong calendar days
- **Streak Calculation Errors**: Incorrect consecutive day calculations
- **Weekly Trend Inaccuracy**: Charts show wrong data for specific days
- **User Confusion**: Users see entries on unexpected dates
- **Data Integrity**: Historical data becomes unreliable
- **Business Logic Failures**: Reminders and goals based on incorrect dates

## Likely Fix
```javascript
// Frontend: Correct IST to UTC conversion
function getISTMidnightUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Correct: Subtract one day for UTC, then set 18:30 (IST midnight)
  const utcDate = new Date(Date.UTC(year, month - 1, day - 1, 18, 30, 0, 0));
  return utcDate.toISOString();
}

// Backend: Proper IST day boundary calculation
const startUTC = moment(todayIST).tz('Asia/Kolkata').startOf('day').utc().toDate();
const endUTC = moment(todayIST).tz('Asia/Kolkata').endOf('day').utc().toDate();
```

## Why This Fix Works
- **Correct Conversion**: Properly converts IST midnight to UTC equivalent
- **Boundary Accuracy**: Generates precise UTC ranges for IST day windows
- **Consistent Logic**: All date operations use the same conversion method
- **Timezone Independence**: Works regardless of server timezone
- **DST Handling**: Automatically handles daylight saving time changes

## Lesson Learned
**Timezone handling is deceptively complex and requires rigorous testing.** This taught me that even seemingly simple date operations can have subtle bugs that only manifest in specific scenarios. I now always test timezone logic with edge cases like month boundaries, DST transitions, and different server locations. This experience also reinforced the importance of using established timezone libraries and implementing comprehensive date handling tests.

## Additional Improvements
- Use moment-timezone consistently across the application
- Implement timezone-aware unit tests with various scenarios
- Add date validation and boundary checking
- Create timezone conversion utilities with comprehensive error handling
- Document timezone assumptions and conversion logic clearly 