/**
 * TypeScript types for Supabase auth and user data.
 *
 * These interfaces represent the shape of user profile data,
 * preferences, and onboarding information stored in Supabase.
 */

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  company: string | null
  job_title: string | null
  location: string | null
  website: string | null
  preferred_framework: string | null
  preferred_industry: string | null
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  default_view: 'grid' | 'list' | 'compact'
  items_per_page: number
  notifications_enabled: boolean
  email_notifications: boolean
  framework_filter: string[]
  industry_filter: string[]
}

export interface OnboardingData {
  full_name: string
  company: string
  job_title: string
  preferred_frameworks: string[]
  preferred_industries: string[]
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  use_cases: string[]
  interests: string[]
}
