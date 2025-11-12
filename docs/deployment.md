# Deployment Guide

This guide covers deploying FinSight to production on Vercel, including environment configuration, database migrations, and verification steps.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Project Setup](#vercel-project-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Deployment Process](#deployment-process)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project** - Production Supabase project created at [app.supabase.com](https://app.supabase.com)
3. **Git Repository** - Code pushed to GitHub, GitLab, or Bitbucket
4. **Environment Variables** - All required keys and URLs ready

## Vercel Project Setup

### 1. Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository
4. Vercel will auto-detect Next.js framework

### 2. Configure Project Settings

In the Vercel project settings, verify:

- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Node.js Version:** `20.x` (configure in Settings → General → Node.js Version)

> **Note:** The `vercel.json` file in the project root configures these settings automatically. Verify they match your requirements.

### 3. Connect Git Repository

- Vercel automatically connects to your Git repository
- **Production deployments** trigger on pushes to `main` branch
- **Preview deployments** trigger on pull requests (automatic)

## Environment Variables

### Required Variables

Configure these in **Vercel Dashboard → Settings → Environment Variables**:

#### Production Environment

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### Preview Environment (for PR deployments)

Use the same variables as production, or create separate Supabase/OpenAI projects for testing.

### Server-Only Variables

**CRITICAL:** Mark these variables as **server-only** in Vercel (not exposed to client):

- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations only
- `OPENAI_API_KEY` - Server-side API calls only

**How to mark as server-only:**
1. In Vercel Dashboard → Environment Variables
2. Click on the variable
3. Uncheck "Expose to Client" or set environment to "Server Only"

### Environment Variable Verification

After deployment, verify variables are accessible:

1. Check build logs for any missing variable warnings
2. Test health check endpoint: `GET https://your-app.vercel.app/api/health`
3. Verify client-side variables are accessible (check browser console)
4. Verify server-only variables are NOT accessible in client code

## Database Migrations

### Migration Strategy

For MVP, migrations are applied **manually** in the Supabase dashboard. Future versions may support automated migrations.

### Migration Files

Migrations are located in `lib/supabase/migrations/`:

1. `001_create_categories.sql`
2. `002_create_transactions.sql`
3. `003_create_budgets.sql`
4. `004_create_categorization_rules.sql`
5. `005_create_chat_messages.sql` (optional for MVP)
6. `006_enable_rls_policies.sql`

### Applying Migrations to Production

#### Step 1: Access Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your **production** project
3. Navigate to **SQL Editor**

#### Step 2: Apply Migrations in Order

**CRITICAL:** Migrations must be applied in numerical order due to foreign key dependencies.

1. Open `001_create_categories.sql` in your local project
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Verify success message
6. Repeat for migrations 002, 003, 004, 005, 006

#### Step 3: Verify Migrations

After applying all migrations:

1. **Check Tables:** Go to **Database → Tables** and verify:
   - `categories`
   - `transactions`
   - `budgets`
   - `categorization_rules`
   - `chat_messages` (if applied)

2. **Check RLS Policies:** Go to **Authentication → Policies** and verify Row Level Security is enabled

3. **Test Connection:** Use the health check endpoint or test-db endpoint:
   ```bash
   curl https://your-app.vercel.app/api/test-db
   ```

### Migration Rollback (If Needed)

If a migration fails or causes issues:

1. Identify the problematic migration
2. Manually reverse the changes in Supabase SQL Editor
3. Fix the migration file locally
4. Re-apply corrected migration
5. Document the issue and resolution

> **Note:** For MVP, rollback is manual. Consider automated migration tools for future versions.

## Production Database Connection

### Testing Production Database Connection

After deploying to production, verify the database connection using the production database test endpoint:

#### 1. Test with Service Role Key

The production database test endpoint (`/api/test-production-db`) verifies:

- **Service Role Connection:** Tests database connectivity using the service role key (admin client)
- **Table Existence:** Verifies all required tables exist in production
- **RLS Policies:** Verifies Row Level Security policies are enabled and working correctly
- **Connection Details:** Validates environment variables are properly configured

**Usage:**

```bash
# Requires authentication (use your session cookie or API token)
curl -X GET https://your-app.vercel.app/api/test-production-db \
  -H "Cookie: your-session-cookie"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "All production database tests passed",
  "tests": {
    "serviceRoleConnection": {
      "passed": true
    },
    "tableExistence": {
      "passed": true,
      "tables": {
        "categories": true,
        "transactions": true,
        "budgets": true,
        "categorization_rules": true,
        "chat_messages": true
      }
    },
    "rlsPolicies": {
      "passed": true,
      "note": "RLS status verified indirectly..."
    },
    "connectionDetails": {
      "supabaseUrl": "https://your-project.supabase.co...",
      "serviceRoleKeySet": true,
      "anonKeySet": true
    }
  },
  "timestamp": "2025-11-11T..."
}
```

#### 2. Verify RLS Policies Directly

To directly verify RLS policies are enabled, run this SQL query in Supabase Dashboard → SQL Editor:

```sql
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'transactions', 'budgets', 'categorization_rules', 'chat_messages');
```

**Expected Result:** All tables should have `rowsecurity = true`

#### 3. Production Database Connection Details

**Connection Method:**
- **Client-side:** Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public variables)
- **Server-side (User Context):** Uses same public variables with user session from cookies
- **Server-side (Admin):** Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only)

**Security Notes:**
- Service role key bypasses RLS policies - use only in API routes, never expose to client
- RLS policies enforce data isolation per user in production
- Admin client (`createAdminClient()`) should only be used for admin operations

**Connection Pooling:**
- Supabase client handles connection pooling automatically
- No manual pool configuration needed
- Connections are managed by Supabase infrastructure

**Verification Checklist:**
- [ ] Service role key connection test passes
- [ ] All required tables exist in production
- [ ] RLS policies are enabled on all tables
- [ ] Environment variables are correctly set in Vercel
- [ ] Database queries work correctly with user authentication
- [ ] Admin operations work correctly with service role key

## Deployment Process

### Automatic Deployment

Vercel automatically deploys when you push to Git:

1. **Production:** Push to `main` branch → triggers production deployment
2. **Preview:** Create pull request → triggers preview deployment

### Manual Deployment

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **Redeploy** on latest deployment (if needed)

### Deployment Verification

During deployment, monitor:

1. **Build Logs:** Check for TypeScript errors, ESLint warnings, build failures
2. **Deployment Status:** Wait for "Ready" status
3. **Build Time:** Note build duration for optimization opportunities

## Post-Deployment Verification

Use this checklist to verify deployment success:

### 1. Application Loads Correctly

- [ ] Visit production URL: `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools

### 2. Environment Variables

- [ ] Health check endpoint returns healthy status: `GET /api/health`
- [ ] Environment variables check passes in health response
- [ ] Server-only variables are NOT exposed to client (check browser console)

### 3. Database Connection

- [ ] Database connectivity check passes in health endpoint
- [ ] Test database endpoint works: `GET /api/test-db`
- [ ] All required tables exist (check test-db response)

### 4. Authentication

- [ ] Sign up flow works: `POST /api/auth/signup`
- [ ] Login flow works: `POST /api/auth/login`
- [ ] Protected routes require authentication
- [ ] Session persists across page refreshes

### 5. API Endpoints

- [ ] All API routes respond correctly
- [ ] Error handling works (test with invalid requests)
- [ ] Rate limiting works (if configured)

### 6. Health Check Endpoint

- [ ] `GET /api/health` returns 200 OK
- [ ] Response includes status, timestamp, and checks
- [ ] Database connectivity check works
- [ ] Environment variable validation works

### 7. Production Build Optimization

- [ ] Build completes without warnings
- [ ] Production build is optimized (check build logs)
- [ ] Static assets are properly served
- [ ] Images are optimized (if using Next.js Image component)

### 8. Database Migrations

- [ ] All migrations applied successfully
- [ ] RLS policies are enabled
- [ ] Indexes are created (check Supabase dashboard)
- [ ] Foreign key constraints are in place

## Troubleshooting

### Build Failures

**Issue:** Build fails with TypeScript errors
- **Solution:** Fix TypeScript errors locally, ensure `npm run build` succeeds before pushing

**Issue:** Build fails with ESLint errors
- **Solution:** Fix ESLint errors locally, run `npm run lint` before pushing

**Issue:** Build fails with missing dependencies
- **Solution:** Ensure `package.json` includes all dependencies, run `npm install` locally to verify

### Environment Variable Issues

**Issue:** Variables not accessible in production
- **Solution:** Verify variables are set in Vercel dashboard, check environment (Production/Preview), redeploy after adding variables

**Issue:** Server-only variables exposed to client
- **Solution:** Mark variables as server-only in Vercel dashboard, verify in browser console

### Database Connection Issues

**Issue:** Database connection fails in production
- **Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct, check Supabase project is active

**Issue:** RLS policies blocking queries
- **Solution:** Verify RLS policies are correctly configured, test with service role key, check policy definitions

### Migration Issues

**Issue:** Migration fails with foreign key error
- **Solution:** Ensure migrations are applied in order (001 → 002 → 003...), check dependencies between tables

**Issue:** Tables missing after deployment
- **Solution:** Verify all migrations were applied, check Supabase dashboard for table existence

### Deployment Issues

**Issue:** Deployment succeeds but app doesn't load
- **Solution:** Check Vercel deployment logs, verify build output, check domain configuration

**Issue:** Preview deployments not working
- **Solution:** Verify Git integration, check pull request settings, ensure preview environment variables are set

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Review Supabase project logs
3. Test health check endpoint: `/api/health`
4. Test database endpoint: `/api/test-db`
5. Review this troubleshooting section

---

**Last Updated:** 2025-11-10
**Version:** 1.0
