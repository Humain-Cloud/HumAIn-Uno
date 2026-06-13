import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * GET /api/setup-supabase
 * Checks whether the required Supabase tables (profiles, user_preferences) exist.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      configured: false,
      error: 'Supabase environment variables are not set',
      tablesExist: false,
    })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    // Check user_preferences table
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1)

    const profilesExists =
      !profilesError ||
      !(profilesError.code === '42P01' || profilesError.message?.includes('not find the table'))
    const prefsExists =
      !prefsError ||
      !(prefsError.code === '42P01' || prefsError.message?.includes('not find the table'))

    // Read the SQL migration content
    let sqlContent: string | null = null
    try {
      const sqlPath = join(
        process.cwd(),
        'supabase',
        'migrations',
        '001_initial_auth_schema.sql',
      )
      sqlContent = readFileSync(sqlPath, 'utf8')
    } catch {
      // Migration file not found
    }

    return NextResponse.json({
      configured: true,
      tablesExist: profilesExists && prefsExists,
      profilesTableExists: profilesExists,
      userPreferencesTableExists: prefsExists,
      profilesError: profilesError?.message || null,
      prefsError: prefsError?.message || null,
      sqlContent,
      supabaseUrl,
      projectRef: supabaseUrl.replace('https://', '').replace('.supabase.co', ''),
    })
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      tablesExist: false,
      error: err.message || 'Failed to check Supabase status',
    })
  }
}

/**
 * POST /api/setup-supabase
 * Attempts to create the required Supabase tables by running the migration SQL.
 *
 * Strategies (tried in order):
 * 1. Direct PostgreSQL connection via `pg` (requires SUPABASE_DB_URL env var)
 * 2. Supabase Management API (requires SUPABASE_ACCESS_TOKEN env var)
 * 3. Falls back to returning the SQL for manual execution
 */
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables are not set' },
      { status: 500 },
    )
  }

  // Read the SQL migration
  let sqlContent: string
  try {
    const sqlPath = join(
      process.cwd(),
      'supabase',
      'migrations',
      '001_initial_auth_schema.sql',
    )
    sqlContent = readFileSync(sqlPath, 'utf8')
  } catch {
    return NextResponse.json(
      { error: 'Migration SQL file not found' },
      { status: 500 },
    )
  }

  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

  // ── Strategy 1: Direct PostgreSQL connection ──
  const dbUrl = process.env.SUPABASE_DB_URL
  if (dbUrl) {
    try {
      const { default: Pool } = await import('pg-pool' as any)
      const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
      const client = await pool.connect()
      try {
        await client.query(sqlContent)
        return NextResponse.json({
          success: true,
          method: 'direct_postgresql',
          message: 'Tables created successfully via direct PostgreSQL connection',
        })
      } finally {
        client.release()
        await pool.end()
      }
    } catch (err: any) {
      console.warn('Direct PostgreSQL setup failed:', err.message)
      // Fall through to next strategy
    }
  }

  // ── Strategy 2: Supabase Management API ──
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN
  if (accessToken) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sqlContent }),
        },
      )

      if (response.ok) {
        return NextResponse.json({
          success: true,
          method: 'management_api',
          message: 'Tables created successfully via Supabase Management API',
        })
      }

      const errorBody = await response.text()
      console.warn('Management API setup failed:', response.status, errorBody)
    } catch (err: any) {
      console.warn('Management API setup failed:', err.message)
    }
  }

  // ── Strategy 3: Try using supabase-js to create tables via RPC ──
  // This won't work unless a custom RPC function exists, but we try anyway
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Try calling an exec_sql RPC if it exists
    const { error: rpcError } = await supabase.rpc('exec_sql' as any, {
      sql_query: sqlContent,
    } as any)

    if (!rpcError) {
      return NextResponse.json({
        success: true,
        method: 'rpc',
        message: 'Tables created successfully via Supabase RPC',
      })
    }
  } catch {
    // RPC method not available – fall through
  }

  // ── All automatic methods failed – return SQL for manual execution ──
  return NextResponse.json({
    success: false,
    method: 'manual',
    message:
      'Could not create tables automatically. Please run the SQL migration manually in the Supabase Dashboard SQL Editor.',
    sqlContent,
    instructions: [
      `1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef}/sql`,
      '2. Click "New Query"',
      '3. Paste the SQL content below and click "Run"',
      '4. Refresh the dashboard page',
    ],
    dashboardUrl: `https://supabase.com/dashboard/project/${projectRef}/sql`,
  })
}
