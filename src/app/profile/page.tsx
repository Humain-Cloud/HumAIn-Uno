'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// shadcn/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Lucide Icons
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  CalendarDays,
  Camera,
  Check,
  X,
  Pencil,
  Shield,
  Star,
  Zap,
  Crown,
  Loader2,
  LogIn,
  Compass,
  Sparkles,
  Cpu,
  Link2,
  FileText,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion'

import type { UserProfile } from '@/lib/supabase/types'

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return 'U'
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

function getMemberLevel(agentsCount: number, bookmarksCount: number): {
  level: string
  color: string
  icon: typeof Crown
  description: string
} {
  const score = agentsCount * 3 + bookmarksCount
  if (score >= 20) return { level: 'Advanced', color: 'text-emerald-600 dark:text-emerald-400', icon: Crown, description: 'Power user with extensive platform experience' }
  if (score >= 8) return { level: 'Intermediate', color: 'text-amber-600 dark:text-amber-400', icon: Zap, description: 'Active member with growing contributions' }
  return { level: 'Beginner', color: 'text-sky-600 dark:text-sky-400', icon: Star, description: 'New member exploring the platform' }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

// ─────────────────────────────────────────────────
// Unauthenticated CTA
// ─────────────────────────────────────────────────

function UnauthenticatedView() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to view and manage your profile, preferences, and account settings.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl h-11"
            onClick={() => router.push('/auth/signin?redirect=/profile')}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign In to Continue
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push('/browse')}
          >
            <Compass className="h-4 w-4 mr-2" /> Browse Agents Instead
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────

function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Skeleton className="h-40 rounded-2xl mb-6" />
      <Skeleton className="h-10 rounded-lg mb-6 w-full max-w-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Profile Edit Form
// ─────────────────────────────────────────────────

function ProfileEditForm({
  profile,
  onSave,
  onCancel,
  saving,
}: {
  profile: UserProfile
  onSave: (data: Partial<UserProfile>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    company: profile.company || '',
    job_title: profile.job_title || '',
    location: profile.location || '',
    website: profile.website || '',
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Full Name</Label>
          <Input
            id="edit-name"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            className="h-10"
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-job">Job Title</Label>
          <Input
            id="edit-job"
            value={form.job_title}
            onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))}
            className="h-10"
            placeholder="e.g., AI Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-company">Company</Label>
          <Input
            id="edit-company"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            className="h-10"
            placeholder="e.g., Acme Corp"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-location">Location</Label>
          <Input
            id="edit-location"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className="h-10"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="edit-website">Website</Label>
          <Input
            id="edit-website"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            className="h-10"
            placeholder="https://yourwebsite.com"
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea
            id="edit-bio"
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            className="min-h-[80px] resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md rounded-xl"
          onClick={() => onSave(form)}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={onCancel} disabled={saving}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────
// Settings Card
// ─────────────────────────────────────────────────

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
  color = 'emerald',
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
  color?: string
}) {
  const colorMap: Record<string, { iconBg: string; iconColor: string; border: string }> = {
    emerald: { iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    amber: { iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    rose: { iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
    violet: { iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
    sky: { iconBg: 'bg-sky-100 dark:bg-sky-900/30', iconColor: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  }
  const c = colorMap[color] || colorMap.emerald

  return (
    <Card className="rounded-xl overflow-hidden">
      <div className={`h-1 bg-gradient-to-r from-${color}-500 to-${color}-600`} />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${c.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth()
  const supabase = createSupabaseBrowserClient()

  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Derived state
  const isAuthenticated = !!user
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const displayEmail = user?.email ?? ''
  const initials = getInitials(displayName, displayEmail)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null
  const memberLevel = getMemberLevel(0, 0)

  // Save profile data to Supabase
  const handleSaveProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return
    setSaving(true)
    setSaveMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        // If profiles table doesn't exist, update user metadata instead
        if (error.code === '42P01') {
          await supabase.auth.updateUser({
            data: {
              full_name: data.full_name,
              bio: data.bio,
              company: data.company,
              job_title: data.job_title,
              location: data.location,
              website: data.website,
            },
          })
          setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
        } else {
          setSaveMessage({ type: 'error', text: error.message })
        }
      } else {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
      }

      await refreshProfile()
      setEditing(false)
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }, [user, supabase, refreshProfile])

  // ─── LOADING STATE
  if (authLoading) {
    return <ProfileLoading />
  }

  // ─── NON-AUTHENTICATED VIEW
  if (!isAuthenticated) {
    return <UnauthenticatedView />
  }

  // ─── AUTHENTICATED VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="h-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 relative">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-8 w-16 h-16 rounded-full border-2 border-white" />
              <div className="absolute top-8 right-16 w-24 h-24 rounded-full border border-white" />
              <div className="absolute bottom-0 left-1/3 w-12 h-12 rounded-full border border-white" />
            </div>
          </div>
          <CardContent className="p-5 sm:p-6 -mt-10 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-900 shadow-lg">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || 'User'} />}
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {displayName || 'User'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary" className={`${memberLevel.color}`}>
                    <memberLevel.icon className="h-3 w-3 mr-1" />
                    {memberLevel.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {displayEmail}
                  </span>
                  {profile?.created_at && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Joined {formatDate(profile.created_at)}
                    </span>
                  )}
                </div>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-lg">{profile.bio}</p>
                )}
              </div>
              <Button
                variant="outline"
                className="rounded-xl shrink-0"
                onClick={() => setEditing(!editing)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {editing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              saveMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 text-red-700 dark:text-red-300'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Edit Form (conditional) */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-emerald-600" /> Edit Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm
                profile={profile || {
                  id: user.id,
                  email: displayEmail,
                  full_name: displayName,
                  avatar_url: avatarUrl,
                  bio: null,
                  company: null,
                  job_title: null,
                  location: null,
                  website: null,
                  preferred_framework: null,
                  preferred_industry: null,
                  onboarding_completed: false,
                  onboarding_step: 0,
                  created_at: user.created_at,
                  updated_at: new Date().toISOString(),
                }}
                onSave={handleSaveProfile}
                onCancel={() => setEditing(false)}
                saving={saving}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 mb-6 w-full sm:w-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <User className="h-4 w-4 mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4 mr-1.5" /> Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm">
            <Sparkles className="h-4 w-4 mr-1.5" /> Preferences
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <motion.div {...fadeInUp} className="space-y-4">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Info */}
              <Card className="rounded-xl">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-600" /> Personal Information
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', value: displayName, icon: User },
                      { label: 'Email', value: displayEmail, icon: Mail },
                      { label: 'Location', value: profile?.location || 'Not set', icon: MapPin },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium truncate">{item.value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Professional Info */}
              <Card className="rounded-xl">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-amber-600" /> Professional
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Company', value: profile?.company || 'Not set', icon: Building2 },
                      { label: 'Job Title', value: profile?.job_title || 'Not set', icon: Briefcase },
                      { label: 'Website', value: profile?.website || 'Not set', icon: Globe },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium truncate">
                            {item.value && item.value.startsWith('http') ? (
                              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
                                {item.value} <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              item.value || '—'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Stats */}
              <Card className="rounded-xl">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-600" /> Platform Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member Level</span>
                      <Badge variant="secondary" className={memberLevel.color}>
                        <memberLevel.icon className="h-3 w-3 mr-1" />
                        {memberLevel.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email Verified</span>
                      <Badge variant="secondary" className={user?.email_confirmed_at ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}>
                        {user?.email_confirmed_at ? 'Yes' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Auth Provider</span>
                      <Badge variant="secondary">
                        {user?.app_metadata?.provider || 'email'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="rounded-xl">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-sky-600" /> Quick Links
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Dashboard', icon: Compass, route: '/dashboard' },
                      { label: 'Browse Agents', icon: Compass, route: '/browse' },
                      { label: 'Settings', icon: Lock, route: '/settings' },
                      { label: 'Setup Profile', icon: Sparkles, route: '/onboarding' },
                    ].map((link) => (
                      <button
                        key={link.label}
                        onClick={() => router.push(link.route)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{link.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ACCOUNT TAB */}
        <TabsContent value="account">
          <motion.div {...fadeInUp} className="space-y-4">
            {/* Security Settings */}
            <SettingsCard
              icon={Lock}
              title="Security"
              description="Manage your password and authentication settings"
              color="emerald"
            >
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-lg"
                  onClick={() => router.push('/auth/reset-password')}
                >
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    Provider: {user?.app_metadata?.provider || 'email'}
                  </Badge>
                  {user?.email_confirmed_at && (
                    <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30">
                      Email Verified
                    </Badge>
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* Notification Settings */}
            <SettingsCard
              icon={Bell}
              title="Notifications"
              description="Configure how you receive updates and alerts"
              color="amber"
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Notification preferences coming soon. You&apos;ll be able to customize email alerts, in-app notifications, and more.</p>
              </div>
            </SettingsCard>

            {/* Data & Privacy */}
            <SettingsCard
              icon={Shield}
              title="Data & Privacy"
              description="Manage your data and privacy settings"
              color="violet"
            >
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-lg"
                  onClick={() => router.push('/privacy-policy')}
                >
                  <FileText className="h-4 w-4 mr-2" /> Privacy Policy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-lg"
                  onClick={() => router.push('/terms-of-service')}
                >
                  <FileText className="h-4 w-4 mr-2" /> Terms of Service
                </Button>
              </div>
            </SettingsCard>

            {/* Danger Zone */}
            <Card className="rounded-xl border-red-200 dark:border-red-800">
              <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600" />
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 text-red-600 dark:text-red-400">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800"
                        onClick={() => signOut()}
                      >
                        <LogIn className="h-4 w-4 mr-2" /> Sign Out
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800"
                        disabled
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences">
          <motion.div {...fadeInUp} className="space-y-4">
            {/* Framework Preference */}
            <SettingsCard
              icon={Cpu}
              title="Framework Preference"
              description="Set your default AI agent framework"
              color="emerald"
            >
              <div className="flex flex-wrap gap-2">
                {['LangGraph', 'CrewAI', 'AutoGen', 'Agno', 'LlamaIndex'].map((fw) => (
                  <Badge
                    key={fw}
                    variant={profile?.preferred_framework === fw ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      profile?.preferred_framework === fw
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                    onClick={async () => {
                      try {
                        await supabase.from('profiles').upsert({
                          id: user.id,
                          preferred_framework: fw,
                          updated_at: new Date().toISOString(),
                        })
                        await refreshProfile()
                      } catch {
                        // fallback: update user metadata
                        await supabase.auth.updateUser({ data: { preferred_framework: fw } })
                        await refreshProfile()
                      }
                    }}
                  >
                    {fw}
                  </Badge>
                ))}
              </div>
            </SettingsCard>

            {/* Industry Preference */}
            <SettingsCard
              icon={Building2}
              title="Industry Interest"
              description="Set your preferred industry focus"
              color="amber"
            >
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Legal', 'Manufacturing'].map((ind) => (
                  <Badge
                    key={ind}
                    variant={profile?.preferred_industry === ind ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      profile?.preferred_industry === ind
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    }`}
                    onClick={async () => {
                      try {
                        await supabase.from('profiles').upsert({
                          id: user.id,
                          preferred_industry: ind,
                          updated_at: new Date().toISOString(),
                        })
                        await refreshProfile()
                      } catch {
                        await supabase.auth.updateUser({ data: { preferred_industry: ind } })
                        await refreshProfile()
                      }
                    }}
                  >
                    {ind}
                  </Badge>
                ))}
              </div>
            </SettingsCard>

            {/* Onboarding */}
            <SettingsCard
              icon={Sparkles}
              title="Onboarding"
              description="Complete your profile setup for a personalized experience"
              color="violet"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={profile?.onboarding_completed ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-amber-600 bg-amber-100 dark:bg-amber-900/30'}>
                  {profile?.onboarding_completed ? 'Completed' : 'Incomplete'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => router.push('/onboarding')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {profile?.onboarding_completed ? 'Redo Onboarding' : 'Complete Setup'}
                </Button>
              </div>
            </SettingsCard>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
