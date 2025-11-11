import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { handleDatabaseError } from '@/lib/supabase/utils'

/**
 * Test database connection and basic operations
 * GET /api/test-db
 */
export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test 1: Basic connection (SELECT 1)
    const { error: connectionError } = await supabase
      .from('categories')
      .select('count')
      .limit(0)

    if (connectionError) {
      // If categories table doesn't exist, try a simpler query
      const { error: simpleError } = await supabase.rpc('version')
      
      if (simpleError) {
        return NextResponse.json(
          {
            success: false,
            error: handleDatabaseError(connectionError, 'Connection test'),
            message: 'Database connection failed. Please ensure migrations are applied.',
          },
          { status: 500 }
        )
      }
    }

    // Test 2: Schema validation - check if tables exist
    const tables = [
      'categories',
      'transactions',
      'budgets',
      'categorization_rules',
      'chat_messages',
    ]

    const schemaResults: Record<string, boolean> = {}
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1)
        schemaResults[table] = !error
      } catch {
        schemaResults[table] = false
      }
    }

    const allTablesExist = Object.values(schemaResults).every((exists) => exists)

    // Test 3: Test error handling with invalid query
    const { error: invalidQueryError } = await supabase
      .from('nonexistent_table')
      .select('*')

    const errorHandlingWorks = !!invalidQueryError

    return NextResponse.json({
      success: true,
      tests: {
        connection: true,
        schema: {
          allTablesExist,
          tables: schemaResults,
        },
        errorHandling: errorHandlingWorks,
      },
      message: allTablesExist
        ? 'All database tests passed'
        : 'Some tables are missing. Please apply migrations.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: handleDatabaseError(error, 'Database test'),
      },
      { status: 500 }
    )
  }
}
