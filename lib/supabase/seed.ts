/**
 * Seed script for development data
 * 
 * Usage:
 * 1. Set up your .env.local with Supabase credentials
 * 2. Create a test user in Supabase Auth
 * 3. Update TEST_USER_ID below with your test user's ID
 * 4. Run: npx tsx lib/supabase/seed.ts
 * 
 * Or add to package.json scripts:
 * "seed": "tsx lib/supabase/seed.ts"
 */

import { createAdminClient } from './server'
import { CategoryInsert, TransactionInsert, BudgetInsert } from '@/types'

// Update this with your test user ID from Supabase Auth
const TEST_USER_ID = 'your-test-user-id-here'

async function seed() {
  const supabase = createAdminClient()

  console.log('[INFO] Starting seed data insertion...')

  // 1. Create sample categories
  const categories: CategoryInsert[] = [
    {
      user_id: TEST_USER_ID,
      name: 'Groceries',
      description: 'Food and household items',
    },
    {
      user_id: TEST_USER_ID,
      name: 'Transportation',
      description: 'Gas, public transit, rideshare',
    },
    {
      user_id: TEST_USER_ID,
      name: 'Dining Out',
      description: 'Restaurants and takeout',
    },
    {
      user_id: TEST_USER_ID,
      name: 'Entertainment',
      description: 'Movies, concerts, hobbies',
    },
    {
      user_id: TEST_USER_ID,
      name: 'Utilities',
      description: 'Electric, water, internet, phone',
    },
  ]

  const { data: insertedCategories, error: categoriesError } = await supabase
    .from('categories')
    .insert(categories)
    .select()

  if (categoriesError) {
    console.error('[ERROR] Failed to insert categories:', categoriesError)
    throw categoriesError
  }

  console.log(`[INFO] Inserted ${insertedCategories?.length || 0} categories`)

  if (!insertedCategories || insertedCategories.length === 0) {
    console.warn('[WARN] No categories inserted, skipping transactions and budgets')
    return
  }

  const groceriesCategory = insertedCategories.find((c) => c.name === 'Groceries')
  const transportationCategory = insertedCategories.find(
    (c) => c.name === 'Transportation'
  )
  const diningCategory = insertedCategories.find((c) => c.name === 'Dining Out')

  // 2. Create sample transactions
  const transactions: TransactionInsert[] = [
    {
      user_id: TEST_USER_ID,
      date: '2025-01-15',
      amount_cents: 12500, // $125.00
      merchant: 'Whole Foods Market',
      description: 'Weekly groceries',
      category_id: groceriesCategory?.id || null,
      is_duplicate: false,
    },
    {
      user_id: TEST_USER_ID,
      date: '2025-01-16',
      amount_cents: 4500, // $45.00
      merchant: 'Shell Gas Station',
      description: 'Gas fill-up',
      category_id: transportationCategory?.id || null,
      is_duplicate: false,
    },
    {
      user_id: TEST_USER_ID,
      date: '2025-01-17',
      amount_cents: 3200, // $32.00
      merchant: 'Starbucks',
      description: 'Coffee and breakfast',
      category_id: diningCategory?.id || null,
      is_duplicate: false,
    },
    {
      user_id: TEST_USER_ID,
      date: '2025-01-18',
      amount_cents: 8900, // $89.00
      merchant: 'Target',
      description: 'Household items',
      category_id: groceriesCategory?.id || null,
      is_duplicate: false,
    },
    {
      user_id: TEST_USER_ID,
      date: '2025-01-19',
      amount_cents: 15000, // $150.00
      merchant: 'Uber',
      description: 'Rideshare to airport',
      category_id: transportationCategory?.id || null,
      is_duplicate: false,
    },
  ]

  const { data: insertedTransactions, error: transactionsError } = await supabase
    .from('transactions')
    .insert(transactions)
    .select()

  if (transactionsError) {
    console.error('[ERROR] Failed to insert transactions:', transactionsError)
    throw transactionsError
  }

  console.log(`[INFO] Inserted ${insertedTransactions?.length || 0} transactions`)

  // 3. Create sample budgets (for January 2025)
  const budgets: BudgetInsert[] = [
    {
      user_id: TEST_USER_ID,
      category_id: groceriesCategory?.id || '',
      month: '2025-01-01',
      amount_cents: 50000, // $500.00
    },
    {
      user_id: TEST_USER_ID,
      category_id: transportationCategory?.id || '',
      month: '2025-01-01',
      amount_cents: 20000, // $200.00
    },
    {
      user_id: TEST_USER_ID,
      category_id: diningCategory?.id || '',
      month: '2025-01-01',
      amount_cents: 30000, // $300.00
    },
  ].filter((b) => b.category_id) // Filter out budgets without valid category_id

  const { data: insertedBudgets, error: budgetsError } = await supabase
    .from('budgets')
    .insert(budgets)
    .select()

  if (budgetsError) {
    console.error('[ERROR] Failed to insert budgets:', budgetsError)
    throw budgetsError
  }

  console.log(`[INFO] Inserted ${insertedBudgets?.length || 0} budgets`)

  console.log('[INFO] Seed data insertion complete!')
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('[INFO] Seed script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[ERROR] Seed script failed:', error)
      process.exit(1)
    })
}

export { seed }
