import { NextRequest, NextResponse } from 'next/server'

/**
 * One-time migration endpoint to check Supabase database tables.
 * After running, this endpoint can be disabled/removed.
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results: string[] = []

    // Check if profiles table exists
    const { error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profileCheckError) {
      results.push(`profiles table: ${profileCheckError.message} (code: ${profileCheckError.code})`)
    } else {
      results.push('profiles table exists ✓')
    }

    // Check if user_preferences table exists
    const { error: prefCheckError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1)

    if (prefCheckError) {
      results.push(`user_preferences table: ${prefCheckError.message} (code: ${prefCheckError.code})`)
    } else {
      results.push('user_preferences table exists ✓')
    }

    return NextResponse.json({
      status: 'checked',
      results,
    })
  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json(
      { error: 'Failed to check migration status', details: String(error) },
      { status: 500 }
    )
  }
}
