# Duration Handling: Days Input → Days API

## 🔄 Updated Backend-Frontend Duration Handling

### Backend (C#):

```csharp
// Backend expects duration in days (not milliseconds anymore)
// API receives: { "duration": 8 } for 8 days
// Backend can handle the conversion internally if needed
```

### Frontend Behavior:

```typescript
// No more conversion needed for sending data
// User input (days) → API (days)
// User enters 8 days → Send 8 to API ✅

// Still convert for display when receiving from API
const millisecondsTodays = (milliseconds: number): number => {
  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
};
```

## 📊 Updated Data Flow:

### 1. GET Subscriptions (API → Frontend):

```typescript
// API Response (still in milliseconds for existing data):
{
  "id": "123",
  "name": "Premium Plan",
  "duration": 691200000, // 8 days in milliseconds
  "price": 100
}

// After conversion (days for display):
{
  "id": "123",
  "name": "Premium Plan",
  "duration": 8, // ✅ Converted to 8 days for UI
  "price": 100
}
```

### 2. POST/PUT Subscriptions (Frontend → API):

```typescript
// Form input (days):
{
  "name": "Premium Plan",
  "duration": 8, // User enters 8 days
  "price": 100,
  "status": "active"
}

// Sent to API (days - no conversion):
{
  "name": "Premium Plan",
  "duration": 8, // ✅ Send 8 days directly to API
  "price": 100,
  "status": "Active" // Only status is capitalized
}
```

## 🎨 Duration Display Still Enhanced:

### formatDuration examples:

| Input Days | Display Output                 |
| ---------- | ------------------------------ |
| `8`        | `"1 Week and 1 Day"`           |
| `30`       | `"1 Month"`                    |
| `45`       | `"1 Month, 2 Weeks and 1 Day"` |
| `365`      | `"1 Year"`                     |

## ✅ Key Changes:

1. **API Input**: Send days directly (8) instead of milliseconds (691200000)
2. **API Output**: Still receive milliseconds, convert to days for display
3. **User Experience**: Unchanged - still input/see days
4. **Backend Flexibility**: Backend handles any internal conversion needed

## 🔄 Conversion Summary:

| Direction          | Before              | After               |
| ------------------ | ------------------- | ------------------- |
| **Frontend → API** | Days → Milliseconds | Days → Days ✅      |
| **API → Frontend** | Milliseconds → Days | Milliseconds → Days |
| **User Input**     | Days                | Days                |
| **User Display**   | Days (formatted)    | Days (formatted)    |
