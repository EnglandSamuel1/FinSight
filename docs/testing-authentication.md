# Testing Authentication System

This guide walks you through testing the complete authentication flow for Story 1.3.

## Prerequisites

1. **Supabase Project Setup**
   - Ensure you have a Supabase project created
   - Environment variables configured in `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

2. **Supabase Dashboard Configuration**
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **Providers**
   - Enable **Email** provider
   - Configure email templates (optional for MVP)
   - Set session timeout: Go to **Authentication** → **Settings** → Set "JWT expiry" to 1800 seconds (30 minutes)

3. **Apply RLS Migration**
   - Go to Supabase dashboard → **SQL Editor**
   - Copy contents of `lib/supabase/migrations/006_enable_rls_policies.sql`
   - Paste and execute in SQL Editor
   - Verify policies were created: Go to **Database** → **Policies** → Check each table has 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Testing Steps

### 1. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 2. Test User Registration (Signup)

#### Test 2.1: Valid Registration
1. Navigate to `/signup`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123` (8+ characters)
   - Confirm Password: `password123`
3. Click "Create account"
4. **Expected:** Redirects to `/dashboard`, shows welcome message with email

#### Test 2.2: Invalid Email Format
1. Navigate to `/signup`
2. Enter:
   - Email: `invalid-email` (no @ symbol)
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account"
4. **Expected:** Shows error "Please enter a valid email address"

#### Test 2.3: Password Too Short
1. Navigate to `/signup`
2. Enter:
   - Email: `test2@example.com`
   - Password: `short` (less than 8 characters)
   - Confirm Password: `short`
3. Click "Create account"
4. **Expected:** Shows error "Password must be at least 8 characters long"

#### Test 2.4: Password Mismatch
1. Navigate to `/signup`
2. Enter:
   - Email: `test3@example.com`
   - Password: `password123`
   - Confirm Password: `different456`
3. Click "Create account"
4. **Expected:** Shows error "Passwords do not match"

#### Test 2.5: Duplicate Email
1. Navigate to `/signup`
2. Enter:
   - Email: `test@example.com` (same as Test 2.1)
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account"
4. **Expected:** Shows error "Email already registered"

### 3. Test User Login

#### Test 3.1: Valid Login
1. Navigate to `/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in"
4. **Expected:** Redirects to `/dashboard`, shows welcome message

#### Test 3.2: Invalid Credentials
1. Navigate to `/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `wrongpassword`
3. Click "Sign in"
4. **Expected:** Shows error "Invalid email or password"

#### Test 3.3: Non-existent User
1. Navigate to `/login`
2. Enter:
   - Email: `nonexistent@example.com`
   - Password: `password123`
3. Click "Sign in"
4. **Expected:** Shows error "Invalid email or password"

### 4. Test Protected Routes

#### Test 4.1: Access Dashboard When Authenticated
1. Ensure you're logged in (from Test 3.1)
2. Navigate to `/dashboard`
3. **Expected:** Dashboard page loads, shows welcome message and logout button

#### Test 4.2: Redirect When Not Authenticated
1. Logout (see Test 5.1)
2. Navigate directly to `/dashboard` (type URL in browser)
3. **Expected:** Automatically redirects to `/login`

#### Test 4.3: Session Persistence
1. Log in (Test 3.1)
2. Refresh the page (F5 or Cmd+R)
3. **Expected:** Still logged in, dashboard still accessible

### 5. Test Logout

#### Test 5.1: Logout Functionality
1. Ensure you're logged in and on `/dashboard`
2. Click "Logout" button
3. **Expected:** Redirects to `/login`, session cleared

#### Test 5.2: Access Protected Route After Logout
1. After logging out (Test 5.1)
2. Try to navigate to `/dashboard`
3. **Expected:** Redirects to `/login`

### 6. Test API Routes (Optional - Using Browser DevTools)

#### Test 6.1: Signup API
1. Open Browser DevTools → Network tab
2. Navigate to `/signup` and create an account
3. Find the request to `/api/auth/signup`
4. **Expected:** Status 200, returns user and session data

#### Test 6.2: Login API
1. Open Browser DevTools → Network tab
2. Navigate to `/login` and sign in
3. Find the request to `/api/auth/login`
4. **Expected:** Status 200, returns user and session data

#### Test 6.3: Logout API
1. Open Browser DevTools → Network tab
2. Click logout button
3. Find the request to `/api/auth/logout`
4. **Expected:** Status 200, returns `{ success: true }`

### 7. Test Row Level Security (RLS) Policies

#### Test 7.1: Verify RLS is Enabled
1. Go to Supabase dashboard → **Database** → **Tables**
2. Click on `categories` table → **Policies** tab
3. **Expected:** See 4 policies (SELECT, INSERT, UPDATE, DELETE) with `auth.uid() = user_id` condition

#### Test 7.2: Test RLS Prevents Cross-User Access (Manual SQL Test)
1. Go to Supabase dashboard → **SQL Editor**
2. Create two test users:
   ```sql
   -- Note: These users should be created through the signup flow
   -- This is just for verification
   ```
3. Try to query another user's data:
   ```sql
   -- This should return empty (when run as User 1, can't see User 2's data)
   SELECT * FROM categories WHERE user_id != auth.uid();
   ```
4. **Expected:** Returns empty result set

#### Test 7.3: Verify User Can Only Access Own Data
1. Log in as `test@example.com`
2. Create a category (if categories API exists) or check in Supabase dashboard
3. Log out
4. Log in as a different user
5. **Expected:** Cannot see first user's categories

### 8. Verify Password Security

#### Test 8.1: Check Passwords Are Hashed
1. Go to Supabase dashboard → **Authentication** → **Users**
2. Find a test user you created
3. **Expected:** Password field shows `***` or is hidden (never shows plaintext)
4. In Supabase SQL Editor, run:
   ```sql
   SELECT id, email, encrypted_password FROM auth.users WHERE email = 'test@example.com';
   ```
5. **Expected:** `encrypted_password` is a hash (long string), not plaintext

## Quick Test Checklist

- [ ] Signup with valid credentials works
- [ ] Signup validation (email format, password length) works
- [ ] Signup with duplicate email shows error
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Protected routes redirect unauthenticated users
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Cannot access protected routes after logout
- [ ] RLS policies are applied to all tables
- [ ] Passwords are hashed (not stored in plaintext)

## Troubleshooting

### Issue: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
**Solution:** Check `.env.local` file exists and has correct environment variables

### Issue: Signup/Login not working
**Solution:** 
1. Check Supabase dashboard → Authentication → Providers → Email is enabled
2. Check browser console for errors
3. Verify environment variables are loaded (restart dev server after adding `.env.local`)

### Issue: Protected routes not redirecting
**Solution:**
1. Check browser console for errors
2. Verify `AuthProvider` is wrapping the app in `app/layout.tsx`
3. Check `ProtectedRoute` component is applied to dashboard page

### Issue: RLS policies not working
**Solution:**
1. Verify migration `006_enable_rls_policies.sql` was executed
2. Check Supabase dashboard → Database → Policies for each table
3. Ensure policies use `auth.uid() = user_id` condition

## Automated Testing (Future Enhancement)

For future stories, consider adding:
- Unit tests for auth utilities (`lib/auth/middleware.ts`)
- Integration tests for API routes
- E2E tests using Playwright or Cypress for full user flows
