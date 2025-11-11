# Deployment Verification Checklist

Use this checklist to verify that FinSight is properly deployed and functioning in production.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code changes committed and pushed to Git repository
- [ ] Production build succeeds locally: `npm run build`
- [ ] All tests pass (if applicable)
- [ ] Environment variables documented in `.env.local.example`
- [ ] Migration files reviewed and tested in development

## Post-Deployment Verification

### 1. Application Loads Correctly

- [ ] Visit production URL: `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools (F12 → Console)
- [ ] No network errors in browser DevTools (F12 → Network)

### 2. Environment Variables

- [ ] Health check endpoint returns healthy status: `GET /api/health`
- [ ] Environment variables check passes in health response
- [ ] All required variables are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - [ ] `OPENAI_API_KEY` (server-only)
- [ ] Server-only variables are NOT exposed to client (check browser console for `NEXT_PUBLIC_*` variables only)

### 3. Database Connection

- [ ] Database connectivity check passes in health endpoint
- [ ] Test database endpoint works: `GET /api/test-db`
- [ ] Response includes `{ success: true }`
- [ ] All required tables exist (check test-db response):
  - [ ] `categories`
  - [ ] `transactions`
  - [ ] `budgets`
  - [ ] `categorization_rules`
  - [ ] `chat_messages` (if applicable)
- [ ] RLS policies are enabled (verify in Supabase dashboard)

### 4. Authentication

- [ ] Sign up flow works: `POST /api/auth/signup`
  - [ ] Create test account successfully
  - [ ] Receive user and session data in response
- [ ] Login flow works: `POST /api/auth/login`
  - [ ] Login with test account successfully
  - [ ] Receive user and session data in response
- [ ] Protected routes require authentication
  - [ ] Access `/dashboard` redirects to login if not authenticated
  - [ ] Access `/dashboard` works when authenticated
- [ ] Session persists across page refreshes
- [ ] Logout works: `POST /api/auth/logout`

### 5. API Endpoints

- [ ] All API routes respond correctly
- [ ] Error handling works (test with invalid requests)
- [ ] Rate limiting works (if configured)
- [ ] CORS headers are correct (if applicable)

### 6. Health Check Endpoint

- [ ] `GET /api/health` returns 200 OK
- [ ] Response includes:
  - [ ] `status`: "healthy" or "unhealthy"
  - [ ] `timestamp`: ISO date string
  - [ ] `checks`: Object with environment and database checks
- [ ] Database connectivity check works
- [ ] Environment variable validation works
- [ ] Endpoint does NOT require authentication (public endpoint)

### 7. Production Build Optimization

- [ ] Build completes without warnings (check Vercel deployment logs)
- [ ] Production build is optimized (check build logs for optimization messages)
- [ ] Static assets are properly served (check Network tab for asset loading)
- [ ] Images are optimized (if using Next.js Image component)
- [ ] Build time is reasonable (< 5 minutes for MVP)

### 8. Database Migrations

- [ ] All migrations applied successfully (001 → 006)
- [ ] RLS policies are enabled (check Supabase dashboard)
- [ ] Indexes are created (check Supabase dashboard → Database → Indexes)
- [ ] Foreign key constraints are in place
- [ ] Schema matches development environment

### 9. Vercel Configuration

- [ ] Framework preset is Next.js
- [ ] Build command is `npm run build`
- [ ] Output directory is `.next`
- [ ] Node.js version is 20.x
- [ ] Environment variables are configured for Production and Preview
- [ ] Git integration is connected
- [ ] Automatic deployments work (push to main triggers deployment)

### 10. Performance

- [ ] Page load time is acceptable (< 3 seconds)
- [ ] API response times are reasonable (< 500ms for most endpoints)
- [ ] No memory leaks (monitor over time)
- [ ] Database queries are optimized (check Supabase dashboard → Database → Query Performance)

## Troubleshooting

If any item fails:

1. **Check Vercel Deployment Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → View Build Logs
   - Look for errors or warnings

2. **Check Supabase Dashboard:**
   - Verify project is active
   - Check database connection settings
   - Review migration status

3. **Test Health Check Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

4. **Test Database Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/test-db
   ```

5. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

6. **Review Documentation:**
   - See `docs/deployment.md` for detailed deployment guide
   - See `lib/supabase/migrations/README.md` for migration guide

## Sign-Off

Once all items are verified:

- [ ] All critical items (1-6) are checked
- [ ] All important items (7-9) are checked
- [ ] Performance is acceptable (10)
- [ ] Documentation is updated if needed

**Deployment Verified By:** _________________  
**Date:** _________________  
**Production URL:** _________________

---

**Last Updated:** 2025-11-10  
**Version:** 1.0
