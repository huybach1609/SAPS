# Status Capitalization Example

## Before the fix:

```typescript
// User input in form
status: "active" // lowercase

// Sent to API
{
  name: "Premium Plan",
  status: "active", // ❌ Wrong format
  duration: 12,
  price: 100
}
```

## After the fix:

```typescript
// User input in form
status: "active" // lowercase

// Automatically converted by capitalizeStatus function
{
  name: "Premium Plan",
  status: "Active", // ✅ Correct format
  duration: 12,
  price: 100
}
```

## The capitalizeStatus function handles:

- "active" → "Active"
- "inactive" → "Inactive"
- "ACTIVE" → "Active"
- "InAcTiVe" → "Inactive"
- "" → "" (empty string)
- null/undefined → returns as-is
