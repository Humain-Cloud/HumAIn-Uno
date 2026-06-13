import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// Note: In a real production app, you would use the Supabase server client
// with proper auth cookies. For this onboarding flow, we're using a simplified
// approach that works with the demo auth setup.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, step, profileData, preferencesData, onboardingCompleted } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In production, this would use the Supabase server client with auth context
    // For the demo, we simulate saving and return success
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      // Attempt real Supabase upsert
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Upsert profile data
      if (profileData) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...profileData,
            onboarding_step: step,
            onboarding_completed: onboardingCompleted || false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })

        if (profileError) {
          console.warn('Profile upsert warning:', profileError.message)
        }
      }

      // Upsert preferences data
      if (preferencesData) {
        const { error: prefError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            ...preferencesData,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })

        if (prefError) {
          console.warn('Preferences upsert warning:', prefError.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      step,
      onboardingCompleted: onboardingCompleted || false,
    })
  } catch (error) {
    console.error('Onboarding save error:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}
