# Manual Testing Guide: Category Management (Story 2.1)

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure you have:**
   - A Supabase project set up with the categories table (from Story 1.2)
   - Environment variables configured (`.env.local`)
   - At least one test user account created

## Test Scenarios

### Setup: Create Test User

1. Navigate to `http://localhost:3000/signup`
2. Create a test user account (e.g., `test@example.com` / `password123`)
3. You should be redirected to the dashboard after signup

---

### Test 1: Create Category with Valid Data (AC #1)

**Goal:** Verify users can create categories with name and optional description

**Steps:**
1. Navigate to `http://localhost:3000/categories`
2. Click "Create Category" button
3. Fill in the form:
   - Name: `Groceries`
   - Description: `Food and household items`
4. Click "Create Category"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Category appears in the list immediately
- ✅ Form resets (name and description fields are empty)
- ✅ No error messages displayed
- ✅ Category shows name "Groceries" and description "Food and household items"

**Verify in Database (Optional):**
- Open Supabase dashboard → Table Editor → `categories`
- Verify the category exists with correct `user_id`, `name`, and `description`

---

### Test 2: Create Category with Only Name (AC #1)

**Goal:** Verify description is optional

**Steps:**
1. On the categories page, click "Create Category"
2. Fill in only the name: `Transportation`
3. Leave description empty
4. Click "Create Category"

**Expected Results:**
- ✅ Category created successfully
- ✅ Category appears in list with only name (no description shown)
- ✅ No validation errors

---

### Test 3: Create Category with Duplicate Name (AC #1, #3)

**Goal:** Verify duplicate names are rejected

**Steps:**
1. Create a category named `Entertainment`
2. Try to create another category with the same name `Entertainment`

**Expected Results:**
- ✅ Error message appears: "Category with this name already exists"
- ✅ Form does not submit
- ✅ Only one "Entertainment" category exists in the list
- ✅ Server returns 409 status code (check browser Network tab)

**Test Case-Insensitive:**
1. Try creating `entertainment` (lowercase) when `Entertainment` exists
2. Should also fail with duplicate name error

---

### Test 4: Create Category with Empty Name (AC #1)

**Goal:** Verify name is required

**Steps:**
1. Click "Create Category"
2. Leave name field empty
3. Try to submit (click "Create Category" or press Enter)

**Expected Results:**
- ✅ Browser shows HTML5 validation error: "Please fill out this field"
- ✅ Form does not submit
- ✅ Error message: "Category name is required"

---

### Test 5: Create Category with Name Too Long (AC #1)

**Goal:** Verify name length validation

**Steps:**
1. Click "Create Category"
2. Enter a name longer than 100 characters (e.g., copy-paste a long string)
3. Try to submit

**Expected Results:**
- ✅ Browser prevents input beyond 100 characters (maxLength attribute)
- ✅ If somehow submitted, server returns 400 validation error
- ✅ Error message: "Category name must be 100 characters or less"

---

### Test 6: List Categories (AC #2)

**Goal:** Verify categories appear in list

**Steps:**
1. Create 3-4 categories with different names
2. View the categories page

**Expected Results:**
- ✅ All created categories appear in the list
- ✅ Categories are ordered by creation date (newest first)
- ✅ Each category shows name and description (if provided)
- ✅ Created date is displayed

**Test Empty State:**
1. Logout and create a new user account
2. Navigate to `/categories` (should be empty)
3. Should see: "No categories yet. Create your first category to get started!"

---

### Test 7: User Isolation (AC #3)

**Goal:** Verify users can only see their own categories

**Steps:**
1. As User A, create categories: `Personal`, `Work`
2. Logout
3. Login as User B (different account)
4. Navigate to `/categories`

**Expected Results:**
- ✅ User B sees empty list (or only their own categories)
- ✅ User B cannot see User A's categories
- ✅ User B cannot access User A's categories via API (test in Network tab)

**Test API Isolation:**
1. As User A, note a category ID from browser Network tab
2. As User B, try to access: `GET /api/categories/{userA_category_id}`
3. Should return 404 (not found) - RLS prevents access

---

### Test 8: Edit Category Name and Description (AC #4)

**Goal:** Verify categories can be edited

**Steps:**
1. Create a category: `Shopping` with description `Clothing and accessories`
2. Click "Edit" button on the category
3. Change name to `Shopping & Retail`
4. Change description to `All shopping expenses`
5. Click "Update Category"

**Expected Results:**
- ✅ Category updates successfully
- ✅ Changes appear immediately in the list
- ✅ Edit mode closes, showing updated category
- ✅ Updated timestamp changes (check in database if needed)

**Test Partial Update:**
1. Edit a category
2. Change only the description, keep name the same
3. Submit
4. ✅ Only description updates, name remains unchanged

---

### Test 9: Edit Category - Duplicate Name (AC #4)

**Goal:** Verify cannot edit to duplicate name

**Steps:**
1. Create two categories: `Category A` and `Category B`
2. Edit `Category B`
3. Try to change name to `Category A`

**Expected Results:**
- ✅ Error message: "Category with this name already exists"
- ✅ Update does not proceed
- ✅ Original name remains

---

### Test 10: Delete Category with No Transactions (AC #5)

**Goal:** Verify categories without transactions can be deleted

**Steps:**
1. Create a category: `Test Category`
2. Click "Delete" button
3. Confirm deletion in the dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirming, category is deleted
- ✅ Category disappears from list immediately
- ✅ No error messages

---

### Test 11: Delete Category with Transactions (AC #5)

**Goal:** Verify deletion warning for categories with transactions

**Prerequisites:** You need transactions table populated (may need to create test transactions manually in Supabase)

**Steps:**
1. Create a category: `Important Category`
2. In Supabase dashboard, create a test transaction with `category_id` pointing to this category
3. On categories page, click "Delete" on `Important Category`
4. Observe the confirmation dialog

**Expected Results:**
- ✅ Confirmation dialog shows warning: "If this category has transactions, they will be uncategorized"
- ✅ User can proceed with deletion
- ✅ Category is deleted
- ✅ Transaction's `category_id` is set to `null` (check in database)

**Note:** If transactions table doesn't exist yet, this test can be deferred until transactions are implemented.

---

### Test 12: Protected Route (AC #1)

**Goal:** Verify unauthenticated users are redirected

**Steps:**
1. Logout (or open incognito window)
2. Navigate directly to `http://localhost:3000/categories`

**Expected Results:**
- ✅ Redirected to `/login` page
- ✅ Cannot access categories page without authentication
- ✅ After login, redirected back to categories page

---

### Test 13: Error Handling

**Goal:** Verify graceful error handling

**Test Network Error:**
1. Open browser DevTools → Network tab
2. Set network to "Offline" or throttle to "Slow 3G"
3. Try to create a category

**Expected Results:**
- ✅ Error message displayed: "Failed to create category" or network error
- ✅ Form remains filled (user doesn't lose data)
- ✅ User can retry

**Test Server Error:**
1. Temporarily break the API (e.g., wrong database connection)
2. Try to create a category

**Expected Results:**
- ✅ Error message displayed (not a crash)
- ✅ Application remains functional
- ✅ User can try again after fixing the issue

---

### Test 14: Loading States

**Goal:** Verify loading indicators appear during operations

**Steps:**
1. Open browser DevTools → Network tab → Throttle to "Slow 3G"
2. Create a category
3. Edit a category
4. Delete a category

**Expected Results:**
- ✅ "Saving..." text appears on submit button during create/update
- ✅ "Deleting..." text appears during delete
- ✅ Buttons are disabled during operations
- ✅ Loading spinner appears when fetching categories list

---

### Test 15: Form Validation - Client Side

**Goal:** Verify client-side validation works

**Steps:**
1. Click "Create Category"
2. Enter name: `A` (1 character) - should be valid
3. Enter name: ` ` (only spaces) - should show error on blur
4. Enter description longer than 500 characters - should show character count

**Expected Results:**
- ✅ Name validation triggers on blur
- ✅ Duplicate name check happens before submit
- ✅ Character counter shows "X/500 characters" for description
- ✅ Form prevents submission if validation fails

---

## Checklist Summary

Use this checklist to track your testing:

- [ ] Test 1: Create category with valid data
- [ ] Test 2: Create category with only name (no description)
- [ ] Test 3: Create category with duplicate name (rejected)
- [ ] Test 4: Create category with empty name (validation error)
- [ ] Test 5: Create category with name too long (validation error)
- [ ] Test 6: List categories (all appear, empty state works)
- [ ] Test 7: User isolation (users can't see each other's categories)
- [ ] Test 8: Edit category name and description
- [ ] Test 9: Edit category to duplicate name (rejected)
- [ ] Test 10: Delete category with no transactions
- [ ] Test 11: Delete category with transactions (warning shown)
- [ ] Test 12: Protected route (redirects unauthenticated users)
- [ ] Test 13: Error handling (network/server errors)
- [ ] Test 14: Loading states (buttons disabled, spinners)
- [ ] Test 15: Form validation (client-side checks)

---

## Browser DevTools Tips

### Network Tab
- Check API requests: `GET /api/categories`, `POST /api/categories`, etc.
- Verify status codes: 200 (success), 400 (validation), 401 (unauthorized), 404 (not found), 409 (duplicate)
- Check request/response payloads

### Console Tab
- Look for any JavaScript errors
- Check for React warnings
- Verify no unexpected errors

### Application Tab
- Check cookies/session storage for auth tokens
- Verify authentication state

---

## Common Issues to Watch For

1. **Categories not appearing:** Check Network tab for API errors, verify authentication
2. **Duplicate name not caught:** Check both client and server validation
3. **Edit not working:** Verify PUT request is sent correctly
4. **Delete not working:** Check DELETE request and transaction check logic
5. **User isolation broken:** Verify RLS policies in Supabase and API user_id checks

---

## After Testing

Once all tests pass, update the story file:
1. Mark test tasks as complete: `[x]` instead of `[ ]`
2. Add any issues found to "Completion Notes"
3. Update status to "review" if everything works
