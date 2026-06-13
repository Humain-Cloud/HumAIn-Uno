import { NextRequest, NextResponse } from 'next/server'

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn('Supabase not configured - onboarding data not saved to cloud')
      return NextResponse.json({
        success: true,
        step,
        onboardingCompleted: onboardingCompleted || false,
        warning: 'Supabase not configured',
      })
    }

    // Use Supabase server client with service role for admin-level operations
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Upsert profile data
    if (profileData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: profileData.email || null,
          full_name: profileData.full_name || null,
          company: profileData.company || null,
          job_title: profileData.job_title || null,
          location: profileData.location || null,
          preferred_framework: profileData.preferred_framework || null,
          preferred_industry: profileData.preferred_industry || null,
          onboarding_step: step,
          onboarding_completed: onboardingCompleted || false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile upsert error:', profileError.message)
        return NextResponse.json(
          { error: 'Failed to save profile data', details: profileError.message },
          { status: 500 }
        )
      }
    }

    // Upsert preferences data
    if (preferencesData) {
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          theme: preferencesData.theme || 'system',
          default_view: preferencesData.default_view || 'grid',
          items_per_page: preferencesData.items_per_page || 24,
          notifications_enabled: preferencesData.notifications_enabled ?? true,
          email_notifications: preferencesData.email_notifications ?? true,
          framework_filter: preferencesData.framework_filter || [],
          industry_filter: preferencesData.industry_filter || [],
          experience_level: preferencesData.experience_level || 'beginner',
          use_cases: preferencesData.use_cases || [],
          interests: preferencesData.interests || [],
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (prefError) {
        console.error('Preferences upsert error:', prefError.message)
        return NextResponse.json(
          { error: 'Failed to save preferences data', details: prefError.message },
          { status: 500 }
        )
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
