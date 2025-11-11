import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandler } from '@/lib/api/route-handler'
import { success, error } from '@/lib/api/response'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Health check endpoint
 * GET /api/health
 * 
 * Returns service health status including:
 * - Basic service status
 * - Database connectivity (optional)
 * - Environment variable validation
 * 
 * This endpoint does NOT require authentication as it's used for
 * monitoring and deployment verification.
 */
export const GET = createRouteHandler(
  async (request: NextRequest, context) => {
    const checks: Record<string, unknown> = {}
    let overallHealthy = true

    // Check 1: Environment variables
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    }

    const envCheck: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      const isSet = !!value
      envCheck[key] = isSet
      if (!isSet) {
        overallHealthy = false
      }
    }
    checks.environment = envCheck

    // Check 2: Database connectivity (optional, but recommended)
    let dbHealthy = false
    let dbError: string | null = null

    try {
      const supabase = await createServerClient()
      // Simple query to test connection
      const { error: queryError } = await supabase
        .from('categories')
        .select('id')
        .limit(1)

      if (queryError) {
        // If categories table doesn't exist, try a simpler connection test
        const { error: simpleError } = await supabase.rpc('version')
        if (simpleError) {
          dbHealthy = false
          dbError = simpleError.message
        } else {
          dbHealthy = true
        }
      } else {
        dbHealthy = true
      }
    } catch (err) {
      dbHealthy = false
      dbError = err instanceof Error ? err.message : 'Unknown database error'
    }

    checks.database = {
      connected: dbHealthy,
      ...(dbError && { error: dbError }),
    }

    if (!dbHealthy) {
      // Database connectivity issues don't necessarily mean unhealthy service
      // but we'll note it in the response
      overallHealthy = false
    }

    // Return health status
    const status = overallHealthy ? 'healthy' : 'unhealthy'

    return success(
      {
        status,
        timestamp: new Date().toISOString(),
        checks,
      },
      overallHealthy ? 200 : 503
    )
  },
  {
    // Health check endpoint should NOT require authentication
    requireAuth: false,
  }
)
