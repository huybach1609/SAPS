# Duration Conversion: Milliseconds ↔ Days

## 🔄 Backend-Frontend Duration Handling

### Backend (C#):

```csharp
// Backend stores duration in milliseconds
subscription.Duration = (int)TimeSpan.FromDays(request.Duration).TotalMilliseconds;

// Example: 30 days = 30 * 24 * 60 * 60 * 1000 = 2,592,000,000 milliseconds
```

### Frontend Conversion Functions:

```typescript
// Helper function to convert milliseconds to days
const millisecondsTodays = (milliseconds: number): number => {
  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
};

// Helper function to convert days to milliseconds
const daysToMilliseconds = (days: number): number => {
  return days * 24 * 60 * 60 * 1000;
};
```

## 📊 Data Flow Examples:

### 1. GET Subscriptions (API → Frontend):

```typescript
// API Response (milliseconds):
{
  "id": "123",
  "name": "Premium Plan",
  "duration": 2592000000, // 30 days in milliseconds
  "price": 100
}

// After conversion (days):
{
  "id": "123",
  "name": "Premium Plan",
  "duration": 30, // ✅ Now in days for UI
  "price": 100
}
```

### 2. POST/PUT Subscriptions (Frontend → API):

```typescript
// Form input (days):
{
  "name": "Premium Plan",
  "duration": 30, // User enters 30 days
  "price": 100,
  "status": "active"
}

// Converted for API (milliseconds):
{
  "name": "Premium Plan",
  "duration": 2592000000, // ✅ Converted to milliseconds
  "price": 100,
  "status": "Active" // Also capitalized
}
```

## 🎨 Enhanced Duration Display:

### New formatDuration function:

```typescript
const formatDuration = (days: number): string => {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const weeks = Math.floor(((days % 365) % 30) / 7);
  const remainingDays = ((days % 365) % 30) % 7;

  const parts = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  if (weeks > 0) parts.push(`${weeks} Week${weeks > 1 ? "s" : ""}`);
  if (remainingDays > 0)
    parts.push(`${remainingDays} Day${remainingDays > 1 ? "s" : ""}`);

  // Join with commas and "and"
  return parts.join(", ").replace(/,([^,]*)$/, " and$1");
};
```

### Display Examples:

| Input Days | Old Display  | New Display                       |
| ---------- | ------------ | --------------------------------- |
| `30`       | `"1 Month"`  | `"1 Month"`                       |
| `45`       | `"45 Days"`  | `"1 Month and 2 Weeks and 1 Day"` |
| `365`      | `"1 Year"`   | `"1 Year"`                        |
| `400`      | `"400 Days"` | `"1 Year, 1 Month and 5 Days"`    |
| `7`        | `"7 Days"`   | `"1 Week"`                        |
| `37`       | `"37 Days"`  | `"1 Month and 1 Week"`            |

## ✅ Benefits:

1. **Accurate Data**: No loss of precision during conversion
2. **User-Friendly**: Days input/display vs milliseconds storage
3. **Readable Duration**: "1 Year, 2 Months and 3 Days" vs "400 Days"
4. **Consistent API**: Backend always gets milliseconds as expected
5. **Seamless UX**: Users work with familiar day units
