# Manual Testing Guide: Transaction Storage & Normalization (Story 3.3)

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure you have:**
   - A Supabase project set up with the transactions table
   - Environment variables configured (`.env.local`)
   - At least one test user account created and logged in

3. **Get authentication cookie:**
   - Log in via the UI at `http://localhost:3000/login`
   - Open browser DevTools (F12) → Application → Cookies
   - Copy the `sb-<project-id>-auth-token` cookie value (you'll need this for API testing)

---

## Testing Workflow

### 1. Upload CSV File (Integrated Flow)

The upload endpoint now **automatically stores transactions** after parsing.

**Via UI:**
1. Navigate to `http://localhost:3000/transactions/upload`
2. Upload a CSV file (e.g., `SOFI-Checking.csv`)
3. Check the browser console and server logs for:
   - Parsing results
   - Storage confirmation
   - Transaction count

**Expected Logs:**
```
[INFO] Starting CSV parsing
[INFO] CSV parsing completed { successCount: 61, errorCount: 0 }
[INFO] Storing parsed transactions { transactionCount: 61 }
[INFO] Transactions stored successfully { storedCount: 61 }
```

**Via API (curl):**
```bash
curl -X POST http://localhost:3000/api/transactions/upload \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -F "file=@/path/to/your/file.csv"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "File uploaded, parsed, and stored successfully",
    "fileName": "SOFI-Checking.csv",
    "fileSize": 3707,
    "fileType": "text/csv",
    "transactions": [...], // Array of stored transactions with IDs
    "errors": [],
    "summary": {
      "totalRows": 62,
      "successCount": 61,
      "errorCount": 0,
      "storedCount": 61  // NEW: Number of transactions stored
    },
    "detectedFormat": "bofa"
  }
}
```

---

### 2. Verify Transactions in Database

**Query transactions via API:**
```bash
curl -X GET "http://localhost:3000/api/transactions" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "user_id": "your-user-id",
      "date": "2024-01-15",
      "amount_cents": 550,
      "merchant": "STARBUCKS",
      "description": "Coffee",
      "category_id": null,
      "is_duplicate": false,
      "created_at": "2024-01-27T...",
      "updated_at": "2024-01-27T..."
    },
    ...
  ]
}
```

**Verify in Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → `transactions`
3. Verify:
   - Transactions are present
   - `user_id` matches your authenticated user
   - Dates are in ISO format (YYYY-MM-DD)
   - Amounts are in cents (integers)
   - Merchant names are normalized
   - Descriptions are preserved

---

### 3. Test Query Filters

**Date Range Filter:**
```bash
curl -X GET "http://localhost:3000/api/transactions?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Category Filter:**
```bash
curl -X GET "http://localhost:3000/api/transactions?categoryId=<category-uuid>" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Pagination:**
```bash
curl -X GET "http://localhost:3000/api/transactions?limit=10&offset=0" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Combined Filters:**
```bash
curl -X GET "http://localhost:3000/api/transactions?startDate=2024-01-01&endDate=2024-01-31&limit=20&offset=0" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Expected Behavior:**
- Date range: Only returns transactions within the specified range
- Category: Only returns transactions with matching category_id
- Pagination: Returns limited results, ordered by date DESC (most recent first)
- Combined: All filters work together

---

### 4. Test Single Transaction Operations

**Get Single Transaction:**
```bash
# First, get a transaction ID from the list
TRANSACTION_ID="<uuid-from-previous-query>"

curl -X GET "http://localhost:3000/api/transactions/$TRANSACTION_ID" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Update Transaction:**
```bash
curl -X PUT "http://localhost:3000/api/transactions/$TRANSACTION_ID" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Updated Merchant Name",
    "category_id": "<category-uuid>",
    "description": "Updated description"
  }'
```

**Delete Transaction:**
```bash
curl -X DELETE "http://localhost:3000/api/transactions/$TRANSACTION_ID" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
```

**Expected Behavior:**
- GET: Returns single transaction or 404 if not found
- PUT: Updates transaction and returns updated data
- DELETE: Removes transaction (hard delete)

---

### 5. Test Bulk Transaction Creation (Direct API)

You can also create transactions directly via the POST endpoint:

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "date": "2024-01-15",
      "amount_cents": 550,
      "merchant": "STARBUCKS",
      "description": "Coffee"
    },
    {
      "date": "2024-01-16",
      "amount_cents": 2500,
      "merchant": "WHOLE FOODS",
      "description": "Groceries"
    }
  ]'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "created": 2,
    "transactions": [
      {
        "id": "uuid-1",
        "user_id": "your-user-id",
        ...
      },
      {
        "id": "uuid-2",
        "user_id": "your-user-id",
        ...
      }
    ]
  }
}
```

---

### 6. Test Error Cases

**Invalid Authentication:**
```bash
curl -X GET http://localhost:3000/api/transactions
# Expected: 401 Unauthorized
```

**Invalid Transaction Data:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "date": "invalid-date",
      "amount_cents": "not-a-number",
      "merchant": ""
    }
  ]'
# Expected: 400 Validation Error
```

**Transaction Not Found:**
```bash
curl -X GET "http://localhost:3000/api/transactions/00000000-0000-0000-0000-000000000000" \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>"
# Expected: 404 Not Found
```

**Unauthorized Access (Different User's Transaction):**
- Try to access a transaction ID that belongs to another user
- Expected: 404 Not Found (security: don't reveal existence)

---

## Verification Checklist

After testing, verify:

- ✅ **Transactions are stored** in the database after CSV upload
- ✅ **User association** - All transactions have correct `user_id`
- ✅ **Data normalization** - Dates in ISO format, amounts in cents
- ✅ **Original data preserved** - Descriptions from CSV are stored
- ✅ **Query filters work** - Date range, category, pagination
- ✅ **Single transaction operations** - GET, PUT, DELETE work correctly
- ✅ **Authentication required** - All endpoints require valid session
- ✅ **Error handling** - Invalid data returns proper error messages
- ✅ **Batch operations** - Multiple transactions can be created at once
- ✅ **Performance** - Large CSV files (100+ transactions) process efficiently

---

## Database Verification

**Check transaction count:**
```sql
SELECT COUNT(*) FROM transactions WHERE user_id = '<your-user-id>';
```

**Check data quality:**
```sql
SELECT 
  date,
  amount_cents,
  merchant,
  description,
  created_at
FROM transactions 
WHERE user_id = '<your-user-id>'
ORDER BY date DESC
LIMIT 10;
```

**Verify normalization:**
```sql
-- Check date format
SELECT date FROM transactions WHERE date !~ '^\d{4}-\d{2}-\d{2}$';

-- Check amount format (should all be integers)
SELECT amount_cents FROM transactions WHERE amount_cents::text ~ '\.';

-- Check merchant names (should not be empty)
SELECT merchant FROM transactions WHERE merchant = '' OR merchant IS NULL;
```

---

## Troubleshooting

**Transactions not storing:**
- Check server logs for errors
- Verify database connection in `.env.local`
- Check Supabase RLS policies allow inserts for authenticated users

**Authentication errors:**
- Refresh your auth cookie (log out and log back in)
- Verify cookie is being sent in requests

**Validation errors:**
- Check that transaction data matches expected schema
- Verify dates are in YYYY-MM-DD format
- Verify amounts are integers (cents)

**Performance issues:**
- Large files (1000+ transactions) may take a few seconds
- Check server logs for timing information
- Consider implementing progress indicators for large uploads

---

## Next Steps

After verifying transaction storage works:

1. **Test duplicate detection** (Story 3.4 - when implemented)
2. **Test categorization** (Story 4.x - when implemented)
3. **Test transaction views** in the UI
4. **Test transaction editing** in the UI
5. **Test bulk operations** (delete multiple, update multiple)
