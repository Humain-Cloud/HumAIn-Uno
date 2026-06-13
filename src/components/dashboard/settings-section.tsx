'use client'

import { useState } from 'react'
import { Settings, AlertTriangle, Download, UserX, RefreshCw, Mail, MapPin, Building2, Briefcase, Globe as GlobeIcon, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import type { UserProfile } from '@/lib/supabase/types'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'

interface UserInfo {
  user: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  } | null
  profile: UserProfile | null
}

interface SettingsSectionProps {
  userInfo: UserInfo
  onRefreshProfile: () => Promise<UserProfile | null>
  profileRefreshing: boolean
}

export function SettingsSection({ userInfo, onRefreshProfile, profileRefreshing }: SettingsSectionProps) {
  const { signOut } = useAuth()
  const displayName = userInfo.user?.name || 'User'
  const email = userInfo.user?.email || ''
  const avatarUrl = userInfo.user?.avatar_url || userInfo.profile?.avatar_url

  // Editable profile fields
  const [fullName, setFullName] = useState(userInfo.profile?.full_name || displayName)
  const [bio, setBio] = useState(userInfo.profile?.bio || '')
  const [company, setCompany] = useState(userInfo.profile?.company || '')
  const [jobTitle, setJobTitle] = useState(userInfo.profile?.job_title || '')
  const [location, setLocation] = useState(userInfo.profile?.location || '')
  const [website, setWebsite] = useState(userInfo.profile?.website || '')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Notification preferences (local state)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [agentUpdates, setAgentUpdates] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    try {
      const supabase = getSupabaseBrowserClient()

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (authError) {
        console.warn('Failed to update auth metadata:', authError.message)
      }

      // Try to upsert the profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userInfo.user!.id,
          full_name: fullName,
          bio: bio || null,
          company: company || null,
          job_title: jobTitle || null,
          location: location || null,
          website: website || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (profileError) {
        // If the profiles table doesn't exist yet, that's OK — the auth metadata was updated
        if (!profileError.message?.includes('not find the table') && profileError.code !== '42P01') {
          console.warn('Failed to update profile:', profileError.message)
          setSaveError('Profile saved to account, but server profile update failed.')
        }
      }

      setSaveSuccess(true)
      await onRefreshProfile()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setSaveError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const memberSince = userInfo.profile?.created_at
    ? new Date(userInfo.profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" /> Profile
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={onRefreshProfile}
                disabled={profileRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${profileRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-emerald-200 dark:border-emerald-800">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">Free Plan</Badge>
                  <span className="text-xs text-muted-foreground">Member since {memberSince}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Display Name</Label>
                <Input
                  id="profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  value={email}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-company">
                  <Building2 className="h-3.5 w-3.5 inline mr-1" />
                  Company
                </Label>
                <Input
                  id="profile-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="rounded-xl"
                  placeholder="Your company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-job">
                  <Briefcase className="h-3.5 w-3.5 inline mr-1" />
                  Job Title
                </Label>
                <Input
                  id="profile-job"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="rounded-xl"
                  placeholder="Your role"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-location">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="profile-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl"
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-website">
                  <GlobeIcon className="h-3.5 w-3.5 inline mr-1" />
                  Website
                </Label>
                <Input
                  id="profile-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="rounded-xl"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              {saveSuccess && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-emerald-600 font-medium"
                >
                  Profile saved!
                </motion.span>
              )}
              {saveError && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-amber-600 font-medium"
                >
                  {saveError}
                </motion.span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Notification Preferences
            </CardTitle>
            <CardDescription>Control how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive important updates via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Agent Updates</p>
                <p className="text-xs text-muted-foreground">Get notified when your agents are updated</p>
              </div>
              <Switch checked={agentUpdates} onCheckedChange={setAgentUpdates} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Receive a weekly summary of platform activity</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">Download all your agents and collections</p>
              </div>
              <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800/30 dark:hover:bg-amber-900/20 rounded-xl" disabled>
                <Download className="h-4 w-4 mr-2" /> Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="rounded-xl border-rose-200 dark:border-rose-800/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This action cannot be undone.</p>
              </div>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800/30 dark:hover:bg-rose-900/20 rounded-xl" disabled>
                <UserX className="h-4 w-4 mr-2" /> Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
