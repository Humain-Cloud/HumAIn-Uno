'use client'

import { Settings, AlertTriangle, Download, UserX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

interface SettingsSectionProps {
  session: any
}

export function SettingsSection({ session }: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-lg">
        {/* Profile Card */}
        <Card className="rounded-xl mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xl font-bold">
                  {(session?.user?.name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{session?.user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={session?.user?.name || ''} disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session?.user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea placeholder="Tell us about yourself..." className="rounded-xl" disabled />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input value="Today" disabled className="bg-gray-50 dark:bg-gray-800 rounded-xl" />
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
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800/30 dark:hover:bg-rose-900/20" disabled>
                <UserX className="h-4 w-4 mr-2" /> Coming Soon
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">Download all your agents and collections</p>
              </div>
              <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800/30 dark:hover:bg-amber-900/20" disabled>
                <Download className="h-4 w-4 mr-2" /> Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
