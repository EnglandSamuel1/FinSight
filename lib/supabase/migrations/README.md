# Database Migrations

This directory contains SQL migration files for setting up the Supabase database schema.

## Migration Files

1. `001_create_categories.sql` - Creates the categories table
2. `002_create_transactions.sql` - Creates the transactions table
3. `003_create_budgets.sql` - Creates the budgets table
4. `004_create_categorization_rules.sql` - Creates the categorization_rules table
5. `005_create_chat_messages.sql` - Creates the chat_messages table (optional for MVP)
6. `006_enable_rls_policies.sql` - Enables Row Level Security (RLS) policies for all tables (CRITICAL for production security)
7. `007_add_confidence_to_transactions.sql` - Adds confidence field to transactions table for automatic categorization feature (REQUIRED for categorization)

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for Production)

**For Production Deployment:**

1. Go to your **production** Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and paste each migration file in order (001, 002, 003, 004, 005, 006, 007)
4. Execute each migration file one at a time
5. Verify each migration succeeds before proceeding to the next
6. **CRITICAL:** Migration 006 (RLS policies) must be applied before 007
7. **IMPORTANT:** Migration 007 adds automatic categorization support - required for CSV imports to work correctly

**For Development:**

1. Use the same process with your development Supabase project
2. Apply all migrations in order
3. Verify schema matches production

### Option 2: Using Supabase CLI

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Apply migrations: `supabase db push`

## Migration Order

Migrations **MUST** be applied in numerical order (001 → 002 → 003 → 004 → 005 → 006 → 007) because:

- `002_create_transactions.sql` depends on `001_create_categories.sql` (foreign key)
- `003_create_budgets.sql` depends on `001_create_categories.sql` (foreign key)
- `004_create_categorization_rules.sql` depends on `001_create_categories.sql` (foreign key)
- `006_enable_rls_policies.sql` depends on all previous tables existing
- `007_add_confidence_to_transactions.sql` depends on `002_create_transactions.sql` (alters transactions table)

**DO NOT skip migrations or apply out of order.**

### ⚠️ Important Note on Migration 007

If you have **existing data** in the transactions table:
- Migration 007 adds a nullable `confidence` column, so existing data will not be affected
- Existing transactions will have `confidence = NULL` (which is valid)
- New transactions imported via CSV will automatically have confidence scores assigned
- You can optionally run the categorization API on existing transactions to populate confidence scores

## Verification

After applying migrations, verify the schema:

1. **Check Tables:** Go to Supabase Dashboard → Database → Tables
   - Verify all tables exist: `categories`, `transactions`, `budgets`, `categorization_rules`, `chat_messages`
   - Verify `transactions` table has `confidence` column (INTEGER, nullable)
   
2. **Check RLS Policies:** Go to Supabase Dashboard → Authentication → Policies
   - Verify Row Level Security is enabled for all tables
   - Verify policies are correctly configured

3. **Test Database Connection:**
   - Run the test endpoint: `GET /api/test-db`
   - Should return `{ success: true, tests: { ... } }`

4. **Check Indexes:** Go to Supabase Dashboard → Database → Indexes
   - Verify indexes are created (especially on foreign keys and frequently queried columns)
   - Verify `idx_transactions_confidence` index exists on `transactions.confidence`

## Production Migration Checklist

Before deploying to production:

- [ ] All migration files reviewed and tested in development
- [ ] Production Supabase project created and accessible
- [ ] Migrations applied in order (001 → 002 → 003 → 004 → 005 → 006 → 007)
- [ ] All tables verified in production database
- [ ] Transactions table has `confidence` column
- [ ] RLS policies enabled and verified
- [ ] Database connection tested with production environment variables
- [ ] Health check endpoint (`/api/health`) returns healthy status
- [ ] Test database endpoint (`/api/test-db`) passes all checks
- [ ] CSV upload tested to verify automatic categorization works

See `docs/deployment.md` for complete production deployment guide.

## Schema Details

See `docs/architecture.md` for complete schema documentation including:
- Table structures
- Relationships
- Indexes
- Constraints

## Quick Reference: Migration 007

**Migration 007** adds automatic categorization support to transactions. This is **required** for the CSV import feature to work correctly.

**When to apply:** After you've completed migrations 001-006

**What it does:**
- Adds `confidence` column (INTEGER, 0-100, nullable) to `transactions` table
- Creates index on `confidence` column for performance
- Supports automatic categorization during CSV import

**SQL to apply (if using Supabase Dashboard):**

```sql
-- Add confidence field to transactions table for categorization confidence tracking
-- Confidence is stored as an integer from 0-100

ALTER TABLE transactions
ADD COLUMN confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100);

-- Create index for filtering by confidence (e.g., finding low-confidence categorizations)
CREATE INDEX IF NOT EXISTS idx_transactions_confidence ON transactions(confidence);

-- Add comment to document the field
COMMENT ON COLUMN transactions.confidence IS 'Categorization confidence score (0-100). NULL indicates no categorization attempted.';
```

**Verification:**
1. Go to Supabase Dashboard → Database → Tables → transactions
2. Verify `confidence` column exists (type: int4, nullable: true)
3. Go to Database → Indexes
4. Verify `idx_transactions_confidence` index exists

**Safe for existing data:** Yes - this migration adds a nullable column, so existing transactions will have `confidence = NULL`
