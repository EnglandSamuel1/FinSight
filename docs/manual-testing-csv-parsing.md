# Manual Testing Guide: CSV Parsing (Story 3.2)

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

## Method 1: Testing via API (curl/Postman)

### Test 1: Parse Chase Format CSV

**Create test CSV file:** `chase-test.csv`
```csv
Transaction Date,Description,Amount
01/15/2024,STARBUCKS STORE #1234,-5.50
01/16/2024,AMAZON.COM PURCHASE,100.00
01/17/2024,TARGET STORE #5678,-45.99
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/transactions/upload \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -F "file=@chase-test.csv"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "File uploaded and parsed successfully",
    "fileName": "chase-test.csv",
    "fileSize": 123,
    "fileType": "text/csv",
    "transactions": [
      {
        "date": "2024-01-15",
        "amount_cents": 550,
        "merchant": "STARBUCKS STORE",
        "description": "STARBUCKS STORE #1234",
        "transaction_type": "debit"
      },
      {
        "date": "2024-01-16",
        "amount_cents": 10000,
        "merchant": "AMAZON.COM PURCHASE",
        "description": "AMAZON.COM PURCHASE",
        "transaction_type": "credit"
      },
      {
        "date": "2024-01-17",
        "amount_cents": 4599,
        "merchant": "TARGET STORE",
        "description": "TARGET STORE #5678",
        "transaction_type": "debit"
      }
    ],
    "errors": [],
    "summary": {
      "totalRows": 4,
      "successCount": 3,
      "errorCount": 0
    },
    "detectedFormat": "chase"
  }
}
```

**Verify:**
- ✅ `detectedFormat` is "chase"
- ✅ All 3 transactions parsed successfully
- ✅ Dates normalized to YYYY-MM-DD format
- ✅ Amounts converted to cents (550 = $5.50)
- ✅ Merchant names extracted correctly
- ✅ Transaction types determined correctly (negative = debit, positive = credit)

---

### Test 2: Parse Bank of America Format CSV

**Create test CSV file:** `bofa-test.csv`
```csv
Date,Description,Amount
01/15/2024,Purchase at AMAZON.COM,100.00
01/16/2024,POS DEBIT STARBUCKS,-5.50
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/transactions/upload \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -F "file=@bofa-test.csv"
```

**Expected Response:**
- ✅ `detectedFormat` is "bofa" or "generic"
- ✅ Transactions parsed successfully
- ✅ Merchant extracted from "Purchase at AMAZON.COM" → "AMAZON.COM"
- ✅ Merchant extracted from "POS DEBIT STARBUCKS" → "STARBUCKS"

---

### Test 3: Parse Generic Format CSV

**Create test CSV file:** `generic-test.csv`
```csv
Date,Description,Amount
2024-01-15,Grocery Store Purchase,50.00
2024-01-16,Gas Station,-30.00
2024-01-17,Restaurant Payment,(25.50)
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/transactions/upload \
  -H "Cookie: sb-<project-id>-auth-token=<your-token>" \
  -F "file=@generic-test.csv"
```

**Expected Response:**
- ✅ `detectedFormat` is "generic"
- ✅ All transactions parsed successfully
- ✅ Parentheses format `(25.50)` parsed as debit
- ✅ ISO date format `2024-01-15` handled correctly

---

### Test 4: Test Date Format Variations

**Create test CSV file:** `date-formats-test.csv`
```csv
Date,Description,Amount
01/15/2024,Test 1,10.00
2024-01-16,Test 2,20.00
1/17/2024,Test 3,30.00
01-18-2024,Test 4,40.00
```

**Expected Results:**
- ✅ All dates normalized to YYYY-MM-DD format
- ✅ No date parsing errors

---

### Test 5: Test Amount Format Variations

**Create test CSV file:** `amount-formats-test.csv`
```csv
Date,Description,Amount
01/15/2024,Test 1,$100.50
01/16/2024,Test 2,-50.00
01/17/2024,Test 3,(25.75)
01/18/2024,Test 4,$1,234.56
01/19/2024,Test 5,€50.00
```

**Expected Results:**
- ✅ Currency symbols removed ($, €)
- ✅ Commas removed from amounts
- ✅ Parentheses parsed as negative
- ✅ All amounts converted to cents correctly
- ✅ Transaction types determined correctly

---

### Test 6: Test Error Handling - Missing Columns

**Create test CSV file:** `missing-columns-test.csv`
```csv
Column1,Column2
Value1,Value2
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [],
    "errors": [
      {
        "row": 1,
        "column": "date",
        "message": "Date column not found. Expected one of: Date, Transaction Date, Post Date, Posted Date, Posting Date"
      },
      {
        "row": 1,
        "column": "amount",
        "message": "Amount column not found. Expected one of: Amount, Transaction Amount, Value, Total"
      }
    ],
    "summary": {
      "totalRows": 2,
      "successCount": 0,
      "errorCount": 2
    }
  }
}
```

**Verify:**
- ✅ System doesn't crash
- ✅ Clear error messages indicating missing columns
- ✅ Error includes row number and expected column names

---

### Test 7: Test Error Handling - Invalid Dates

**Create test CSV file:** `invalid-dates-test.csv`
```csv
Date,Description,Amount
Invalid Date,Test 1,10.00
01/15/2024,Test 2,20.00
13/45/2024,Test 3,30.00
```

**Expected Response:**
- ✅ Row 2 (Invalid Date) has error
- ✅ Row 3 (13/45/2024) has error
- ✅ Row 2 (01/15/2024) parses successfully
- ✅ `successCount` = 1, `errorCount` = 2
- ✅ System continues parsing remaining rows

---

### Test 8: Test Error Handling - Invalid Amounts

**Create test CSV file:** `invalid-amounts-test.csv`
```csv
Date,Description,Amount
01/15/2024,Test 1,Invalid Amount
01/16/2024,Test 2,50.00
01/17/2024,Test 3,ABC123
```

**Expected Response:**
- ✅ Rows with invalid amounts have errors
- ✅ Valid amounts parse successfully
- ✅ Partial parsing succeeds (some rows fail, others succeed)

---

### Test 9: Test Empty CSV File

**Create empty file:** `empty.csv` (0 bytes)

**Expected Response:**
- ✅ Error message: "CSV file is empty"
- ✅ `errorCount` = 1
- ✅ System doesn't crash

---

### Test 10: Test Malformed CSV

**Create test CSV file:** `malformed-test.csv`
```csv
Date,Description,Amount
01/15/2024,"Unclosed quote,10.00
01/16/2024,Valid row,20.00
```

**Expected Response:**
- ✅ System handles malformed CSV gracefully
- ✅ Valid rows still parse if possible
- ✅ Errors reported for problematic rows

---

## Method 2: Testing via UI

### Prerequisites

1. Navigate to `http://localhost:3000/transactions/upload`
2. Ensure you're logged in (you should see the upload page)

### Test Scenarios

#### Test 1: Upload Chase Format CSV

**Steps:**
1. Create `chase-test.csv` (see Test 1 above)
2. Drag and drop the file onto the upload area OR click "browse files"
3. Click "Upload File"
4. Wait for upload to complete

**Expected Results:**
- ✅ File uploads successfully
- ✅ Success toast notification appears
- ✅ **Note:** UI component currently shows basic success message. Parsing results are returned but not displayed yet. Check browser DevTools → Network tab → Response to see parsing results.

**To see parsing results:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload file
4. Click on the `/api/transactions/upload` request
5. View Response tab to see parsed transactions

---

#### Test 2: Upload File with Errors

**Steps:**
1. Create `invalid-dates-test.csv` (see Test 7 above)
2. Upload the file

**Expected Results:**
- ✅ File uploads successfully
- ✅ Parsing completes with errors
- ✅ Check Network tab response to see error details

---

#### Test 3: Upload Non-CSV File

**Steps:**
1. Try to upload a `.txt` or `.pdf` file

**Expected Results:**
- ✅ Error message: "Invalid file type. Only CSV files are allowed."
- ✅ File is rejected before upload

---

#### Test 4: Upload File Over 10MB

**Steps:**
1. Create a large CSV file (> 10MB) or use a file generator

**Expected Results:**
- ✅ Error message: "File size exceeds maximum allowed size of 10MB"
- ✅ File is rejected before upload

---

## Method 3: Testing with Automated Tests

Run the test suite:

```bash
npm test
```

**Expected Results:**
- ✅ All parser utility tests pass
- ✅ Date normalizer tests pass
- ✅ Amount normalizer tests pass
- ✅ Merchant extractor tests pass
- ✅ Bank format detection tests pass
- ✅ CSV parser integration tests pass

---

## Verification Checklist

After testing, verify:

- [ ] **Format Detection:** Chase, BofA, Wells Fargo, and generic formats are detected correctly
- [ ] **Date Normalization:** All date formats normalize to YYYY-MM-DD
- [ ] **Amount Normalization:** Currency symbols, commas, parentheses handled correctly
- [ ] **Merchant Extraction:** Merchant names extracted from various description patterns
- [ ] **Error Handling:** Missing columns, invalid dates, invalid amounts handled gracefully
- [ ] **Partial Parsing:** System continues parsing when some rows fail
- [ ] **Error Reporting:** Errors include row numbers, column names, and clear messages
- [ ] **No Crashes:** System never crashes, always returns structured response
- [ ] **Logging:** Check server logs for parsing results (format detected, success/error counts)

---

## Browser DevTools Tips

### Network Tab
- Check API request: `POST /api/transactions/upload`
- Verify status code: 200 (success)
- View request payload: FormData with file
- View response: JSON with transactions, errors, and summary

### Console Tab
- Look for any JavaScript errors
- Check for React warnings
- Verify no unexpected errors

---

## Common Issues to Watch For

1. **Parsing fails silently:** Check Network tab response for error details
2. **Wrong format detected:** Verify CSV headers match expected column names
3. **Dates not parsing:** Check date format matches supported formats
4. **Amounts incorrect:** Verify amount format (currency symbols, commas, etc.)
5. **Merchant extraction poor:** Check description patterns match expected formats
6. **Errors not reported:** Check response includes `errors` array
7. **System crashes:** Should never happen - all errors are caught and reported

---

## Sample CSV Files for Testing

### Chase Format
```csv
Transaction Date,Description,Amount
01/15/2024,STARBUCKS STORE #1234,-5.50
01/16/2024,AMAZON.COM,100.00
```

### Bank of America Format
```csv
Date,Description,Amount
01/15/2024,Purchase at AMAZON.COM,100.00
01/16/2024,POS DEBIT STARBUCKS,-5.50
```

### Wells Fargo Format
```csv
Date,Description,Amount
01/15/2024,NETFLIX.COM SUBSCRIPTION,-15.99
01/16/2024,PAYPAL.COM PAYMENT,50.00
```

### Generic Format
```csv
Date,Description,Amount
2024-01-15,Grocery Store,50.00
2024-01-16,Gas Station,-30.00
```

### Test Error Scenarios
```csv
Date,Description,Amount
Invalid Date,Test 1,10.00
01/15/2024,Test 2,Invalid Amount
01/16/2024,Test 3,50.00
```

---

## After Testing

Once all tests pass:

1. ✅ Verify all acceptance criteria are met
2. ✅ Check that parsing results are returned correctly
3. ✅ Verify error handling works as expected
4. ✅ Note any issues or improvements needed
5. ✅ Update story status if ready for review

---

**Note:** The UI component (`TransactionUpload.tsx`) currently shows basic success/error messages but doesn't display parsing results (transactions, errors, summary). This is expected - the parsing functionality is complete and working via the API. Displaying parsing results in the UI would be a separate enhancement.
