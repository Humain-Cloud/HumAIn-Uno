'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAppStore, type AppSettings } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Search,
  Bell,
  Database,
  Info,
  Trash2,
  Download,
  Github,
  Scale,
  Star,
  LayoutGrid,
  List,
  AlignJustify,
  Home,
  Compass,
  Library,
  ArrowUpDown,
  Sparkles,
  GitCompareArrows,
  Keyboard,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings, searchHistory, clearSearchHistory, bookmarkedAgentIds, ratings } = useAppStore()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => void
  }>({ open: false, title: '', description: '', action: () => {} })

  // Default settings for reset
  const defaultSettings: AppSettings = {
    theme: 'system',
    defaultView: 'home',
    defaultViewMode: 'grid',
    defaultSortOrder: 'popular',
    defaultFramework: null,
    itemsPerPage: 24,
    showAiChatSuggestions: true,
    showCompareBar: true,
    enableKeyboardShortcuts: true,
  }

  const handleResetToDefaults = () => {
    setConfirmDialog({
      open: true,
      title: 'Reset Settings to Defaults',
      description: 'This will reset all your preferences to their default values. Your bookmarks and search history will be preserved.',
      action: () => {
        updateSettings(defaultSettings)
        setTheme(defaultSettings.theme)
        toast({ title: 'Settings reset', description: 'All preferences have been restored to defaults.' })
      },
    })
  }

  const handleClearSearchHistory = () => {
    setConfirmDialog({
      open: true,
      title: 'Clear Search History',
      description: 'This will permanently delete your search history. This action cannot be undone.',
      action: () => {
        clearSearchHistory()
        toast({ title: 'Search history cleared', description: 'Your search history has been deleted.' })
      },
    })
  }

  const handleClearBookmarks = () => {
    setConfirmDialog({
      open: true,
      title: 'Clear Bookmarks',
      description: `This will remove all ${bookmarkedAgentIds.length} bookmarked agents. This action cannot be undone.`,
      action: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('humain-bookmarks')
        }
        // We need to reset bookmarks via store — we'll just reload for simplicity
        toast({ title: 'Bookmarks cleared', description: 'Your bookmarks have been removed. Refreshing...' })
        setTimeout(() => window.location.reload(), 500)
      },
    })
  }

  const handleClearAllData = () => {
    setConfirmDialog({
      open: true,
      title: 'Clear All Local Data',
      description: 'This will remove all bookmarks, ratings, search history, collections, and settings. This action cannot be undone.',
      action: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('humain-bookmarks')
          localStorage.removeItem('humain-collections')
          localStorage.removeItem('humain-ratings')
          localStorage.removeItem('humain-search-history')
          localStorage.removeItem('humain-settings')
        }
        toast({ title: 'All data cleared', description: 'All local data has been removed. Refreshing...' })
        setTimeout(() => window.location.reload(), 500)
      },
    })
  }

  const handleExportBookmarks = () => {
    const data = {
      bookmarks: bookmarkedAgentIds,
      ratings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `humain-bookmarks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: 'Bookmarks exported', description: 'Your bookmarks have been exported as JSON.' })
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const defaultViewOptions = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'browse', label: 'Browse', icon: Compass },
    { value: 'hub', label: 'Knowledge Hub', icon: Library },
  ]

  const viewModeOptions = [
    { value: 'grid', label: 'Grid', icon: LayoutGrid },
    { value: 'list', label: 'List', icon: List },
    { value: 'compact', label: 'Compact', icon: AlignJustify },
  ]

  const sortOrderOptions = [
    { value: 'popular', label: 'Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'most-starred', label: 'Most Starred' },
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' },
  ]

  const frameworkOptions = [
    { value: 'all', label: 'All Frameworks' },
    { value: 'langgraph', label: 'LangGraph' },
    { value: 'crewai', label: 'CrewAI' },
    { value: 'autogen', label: 'AutoGen' },
    { value: 'agno', label: 'Agno' },
    { value: 'llamaindex', label: 'LlamaIndex' },
  ]

  const itemsPerPageOptions = [12, 24, 48]

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold relative">
          Settings
          <span className="absolute -bottom-1 left-0 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your preferences, data, and application settings
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                Appearance
              </CardTitle>
              <CardDescription>Customize how Humain-Uno looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-2">
                  {themeOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={theme === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 rounded-xl min-h-[44px] transition-all duration-200 ${
                        theme === opt.value
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                      onClick={() => {
                        setTheme(opt.value)
                        updateSettings({ theme: opt.value as AppSettings['theme'] })
                      }}
                    >
                      <opt.icon className="h-4 w-4 mr-1.5" />
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Default View */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default View</label>
                <p className="text-xs text-muted-foreground">Which page opens when you visit the app</p>
                <div className="flex gap-2">
                  {defaultViewOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={settings.defaultView === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 rounded-xl min-h-[44px] transition-all duration-200 ${
                        settings.defaultView === opt.value
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                      onClick={() => updateSettings({ defaultView: opt.value as AppSettings['defaultView'] })}
                    >
                      <opt.icon className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">{opt.label}</span>
                      <span className="sm:hidden">{opt.value === 'hub' ? 'Hub' : opt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Default View Mode */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default View Mode</label>
                <p className="text-xs text-muted-foreground">How agents are displayed in the browse view</p>
                <div className="flex gap-2">
                  {viewModeOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={settings.defaultViewMode === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 rounded-xl min-h-[44px] transition-all duration-200 ${
                        settings.defaultViewMode === opt.value
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                      onClick={() => updateSettings({ defaultViewMode: opt.value as AppSettings['defaultViewMode'] })}
                    >
                      <opt.icon className="h-4 w-4 mr-1.5" />
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Preferences Section */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                Search Preferences
              </CardTitle>
              <CardDescription>Configure default search and browsing behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  Default Sort Order
                </label>
                <Select
                  value={settings.defaultSortOrder}
                  onValueChange={(v) => updateSettings({ defaultSortOrder: v as AppSettings['defaultSortOrder'] })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOrderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Default Framework Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Framework Filter</label>
                <Select
                  value={settings.defaultFramework || 'all'}
                  onValueChange={(v) => updateSettings({ defaultFramework: v === 'all' ? null : v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworkOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Items Per Page */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Items Per Page</label>
                <p className="text-xs text-muted-foreground">Number of agents shown before loading more</p>
                <div className="flex gap-2">
                  {itemsPerPageOptions.map((num) => (
                    <Button
                      key={num}
                      variant={settings.itemsPerPage === num ? 'default' : 'outline'}
                      size="sm"
                      className={`flex-1 rounded-xl min-h-[44px] transition-all duration-200 ${
                        settings.itemsPerPage === num
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                      onClick={() => updateSettings({ itemsPerPage: num as AppSettings['itemsPerPage'] })}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences Section */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Notification Preferences
              </CardTitle>
              <CardDescription>Control which UI elements and notifications are shown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle: Show AI Chat Suggestions */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${settings.showAiChatSuggestions ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Show AI Chat Suggestions</p>
                    <p className="text-xs text-muted-foreground">Display the floating AI assistant button</p>
                  </div>
                </div>
                <button
                  className={`switch-emerald ${settings.showAiChatSuggestions ? 'active' : ''}`}
                  onClick={() => updateSettings({ showAiChatSuggestions: !settings.showAiChatSuggestions })}
                  role="switch"
                  aria-checked={settings.showAiChatSuggestions}
                  aria-label="Toggle AI Chat Suggestions"
                >
                  <div className="switch-thumb" />
                </button>
              </div>

              <Separator />

              {/* Toggle: Show Compare Bar */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${settings.showCompareBar ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                    <GitCompareArrows className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Show Compare Bar</p>
                    <p className="text-xs text-muted-foreground">Display the comparison bar when agents are selected</p>
                  </div>
                </div>
                <button
                  className={`switch-emerald ${settings.showCompareBar ? 'active' : ''}`}
                  onClick={() => updateSettings({ showCompareBar: !settings.showCompareBar })}
                  role="switch"
                  aria-checked={settings.showCompareBar}
                  aria-label="Toggle Compare Bar"
                >
                  <div className="switch-thumb" />
                </button>
              </div>

              <Separator />

              {/* Toggle: Enable Keyboard Shortcuts */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${settings.enableKeyboardShortcuts ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                    <Keyboard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enable Keyboard Shortcuts</p>
                    <p className="text-xs text-muted-foreground">Use keyboard shortcuts for navigation (/, ?, g+b)</p>
                  </div>
                </div>
                <button
                  className={`switch-emerald ${settings.enableKeyboardShortcuts ? 'active' : ''}`}
                  onClick={() => updateSettings({ enableKeyboardShortcuts: !settings.enableKeyboardShortcuts })}
                  role="switch"
                  aria-checked={settings.enableKeyboardShortcuts}
                  aria-label="Toggle Keyboard Shortcuts"
                >
                  <div className="switch-thumb" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management Section */}
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Database className="h-4 w-4 text-white" />
                </div>
                Data Management
              </CardTitle>
              <CardDescription>Manage your local data and storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Clear Search History */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Search History</p>
                  <p className="text-xs text-muted-foreground">{searchHistory.length} recent searches stored</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/20 min-h-[36px]"
                  onClick={handleClearSearchHistory}
                  disabled={searchHistory.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              </div>

              <Separator />

              {/* Clear Bookmarks */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Bookmarks</p>
                  <p className="text-xs text-muted-foreground">{bookmarkedAgentIds.length} agents bookmarked</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/20 min-h-[36px]"
                  onClick={handleClearBookmarks}
                  disabled={bookmarkedAgentIds.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              </div>

              <Separator />

              {/* Export Bookmarks */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Export Bookmarks</p>
                  <p className="text-xs text-muted-foreground">Download bookmarks and ratings as JSON</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl min-h-[36px] hover:border-emerald-300 dark:hover:border-emerald-700"
                  onClick={handleExportBookmarks}
                  disabled={bookmarkedAgentIds.length === 0 && Object.keys(ratings).length === 0}
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Export
                </Button>
              </div>

              <Separator />

              {/* Clear All Data */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Clear All Local Data</p>
                  <p className="text-xs text-muted-foreground">Remove all bookmarks, ratings, history, and settings</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/20 min-h-[36px]"
                  onClick={handleClearAllData}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="secondary" className="font-mono text-xs">1.0.0</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source Code</span>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  <Github className="h-4 w-4" /> GitHub Repository
                </a>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">License</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  MIT License
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tech Stack</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">Next.js</Badge>
                  <Badge variant="outline" className="text-[10px]">TypeScript</Badge>
                  <Badge variant="outline" className="text-[10px]">Prisma</Badge>
                </div>
              </div>

              {/* Reset to Defaults Button */}
              <div className="pt-4 mt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reset to Defaults</p>
                    <p className="text-xs text-muted-foreground">Restore all preferences to their original values</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 min-h-[36px]"
                    onClick={handleResetToDefaults}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                </div>
              </div>

              {/* Decorative footer */}
              <div className="pt-4 mt-2 border-t text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">
                    Humain<span className="text-emerald-600 dark:text-emerald-400">-Uno</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Powered by 800+ curated AI agent projects
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  © 2025 Humain-Uno. Open Source under MIT.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
              className="rounded-xl min-h-[36px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialog.action()
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }}
              className="rounded-xl min-h-[36px]"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
