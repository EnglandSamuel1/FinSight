# Database Migrations

This directory contains SQL migration files for setting up the Supabase database schema.

## Migration Files

1. `001_create_categories.sql` - Creates the categories table
2. `002_create_transactions.sql` - Creates the transactions table
3. `003_create_budgets.sql` - Creates the budgets table
4. `004_create_categorization_rules.sql` - Creates the categorization_rules table
5. `005_create_chat_messages.sql` - Creates the chat_messages table (optional for MVP)
6. `006_enable_rls_policies.sql` - Enables Row Level Security (RLS) policies for all tables (CRITICAL for production security)

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for Production)

**For Production Deployment:**

1. Go to your **production** Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order (001, 002, 003, 004, 005, 006)
4. Execute each migration file one at a time
5. Verify each migration succeeds before proceeding to the next
6. **CRITICAL:** Migration 006 (RLS policies) must be applied last for security

**For Development:**

1. Use the same process with your development Supabase project
2. Apply all migrations in order
3. Verify schema matches production

### Option 2: Using Supabase CLI

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Apply migrations: `supabase db push`

## Migration Order

Migrations **MUST** be applied in numerical order (001 → 002 → 003 → 004 → 005 → 006) because:

- `002_create_transactions.sql` depends on `001_create_categories.sql` (foreign key)
- `003_create_budgets.sql` depends on `001_create_categories.sql` (foreign key)
- `004_create_categorization_rules.sql` depends on `001_create_categories.sql` (foreign key)
- `006_enable_rls_policies.sql` depends on all previous tables existing

**DO NOT skip migrations or apply out of order.**

## Verification

After applying migrations, verify the schema:

1. **Check Tables:** Go to Supabase Dashboard → Database → Tables
   - Verify all tables exist: `categories`, `transactions`, `budgets`, `categorization_rules`, `chat_messages`
   
2. **Check RLS Policies:** Go to Supabase Dashboard → Authentication → Policies
   - Verify Row Level Security is enabled for all tables
   - Verify policies are correctly configured

3. **Test Database Connection:**
   - Run the test endpoint: `GET /api/test-db`
   - Should return `{ success: true, tests: { ... } }`

4. **Check Indexes:** Go to Supabase Dashboard → Database → Indexes
   - Verify indexes are created (especially on foreign keys and frequently queried columns)

## Production Migration Checklist

Before deploying to production:

- [ ] All migration files reviewed and tested in development
- [ ] Production Supabase project created and accessible
- [ ] Migrations applied in order (001 → 006)
- [ ] All tables verified in production database
- [ ] RLS policies enabled and verified
- [ ] Database connection tested with production environment variables
- [ ] Health check endpoint (`/api/health`) returns healthy status
- [ ] Test database endpoint (`/api/test-db`) passes all checks

See `docs/deployment.md` for complete production deployment guide.

## Schema Details

See `docs/architecture.md` for complete schema documentation including:
- Table structures
- Relationships
- Indexes
- Constraints
