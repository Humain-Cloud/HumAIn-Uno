'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  WrapText,
  Search,
  X,
  Pencil,
  Code2,
  Type,
  ToggleLeft,
  ToggleRight,
  FileCode,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from '@/hooks/use-toast'

interface CodePlaygroundProps {
  code: string
  language?: string
  agentName?: string
}

type FontSize = 'small' | 'medium' | 'large'

const fontSizes: Record<FontSize, { label: string; size: string; class: string }> = {
  small: { label: 'S', size: '0.7rem', class: 'text-xs' },
  medium: { label: 'M', size: '0.8rem', class: 'text-sm' },
  large: { label: 'L', size: '0.95rem', class: 'text-base' },
}

function Minimap({ code, scrollRef }: { code: string; scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const lines = code.split('\n')
  const totalLines = lines.length
  const [viewportTop, setViewportTop] = useState(0)
  const [viewportRatio, setViewportRatio] = useState(1)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1)
      setViewportTop(scrollRatio * 100)
      const visibleRatio = el.clientHeight / (el.scrollHeight || 1)
      setViewportRatio(Math.max(visibleRatio * 100, 5))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scrollRef, code])

  const handleMinimapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickRatio = (e.clientY - rect.top) / rect.height
    el.scrollTop = clickRatio * (el.scrollHeight - el.clientHeight)
  }, [scrollRef])

  return (
    <div
      className="w-14 shrink-0 bg-gray-900/80 dark:bg-gray-950/90 rounded-r-lg overflow-hidden cursor-pointer relative border-l border-gray-700/50"
      onClick={handleMinimapClick}
    >
      <div className="py-1 px-0.5 space-y-px">
        {lines.map((line, i) => (
          <div
            key={i}
            className="h-[2px] rounded-sm"
            style={{
              width: `${Math.min(100, (line.trim().length / 80) * 100)}%`,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
      {/* Viewport indicator */}
      <div
        className="absolute left-0 right-0 bg-white/10 border-y border-white/20 pointer-events-none transition-all duration-100"
        style={{
          top: `${viewportTop}%`,
          height: `${viewportRatio}%`,
        }}
      />
    </div>
  )
}

export function CodePlayground({ code, language = 'python', agentName = 'agent' }: CodePlaygroundProps) {
  const [lang, setLang] = useState(language)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [wordWrap, setWordWrap] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedCode, setEditedCode] = useState(code)
  const [copied, setCopied] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatchIndex, setSearchMatchIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLang(language)
  }, [language])

  useEffect(() => {
    setEditedCode(code)
  }, [code])

  const displayCode = editMode ? editedCode : code

  const lineCount = displayCode.split('\n').length
  const charCount = displayCode.length

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return []
    const matches: number[] = []
    const lowerCode = displayCode.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    let pos = 0
    while ((pos = lowerCode.indexOf(lowerQuery, pos)) !== -1) {
      matches.push(pos)
      pos += 1
    }
    return matches
  }, [displayCode, searchQuery])

  useEffect(() => {
    setSearchMatchIndex(0)
  }, [searchQuery])

  // Ctrl+F handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const ext = lang === 'python' ? 'py' : lang === 'typescript' ? 'ts' : 'js'
    const blob = new Blob([displayCode], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${agentName.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
    toast({
      title: 'Downloaded!',
      description: `Code saved as ${agentName.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`,
    })
  }

  const handleNextSearch = () => {
    if (searchMatches.length === 0) return
    const next = (searchMatchIndex + 1) % searchMatches.length
    setSearchMatchIndex(next)
    // Scroll to match
    const lines = displayCode.substring(0, searchMatches[next]).split('\n').length
    if (scrollRef.current) {
      const lineEl = scrollRef.current.querySelector(`[data-line-number="${lines}"]`)
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handlePrevSearch = () => {
    if (searchMatches.length === 0) return
    const prev = searchMatchIndex === 0 ? searchMatches.length - 1 : searchMatchIndex - 1
    setSearchMatchIndex(prev)
    const lines = displayCode.substring(0, searchMatches[prev]).split('\n').length
    if (scrollRef.current) {
      const lineEl = scrollRef.current.querySelector(`[data-line-number="${lines}"]`)
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[100] bg-gray-950 flex flex-col'
    : 'flex flex-col rounded-lg border bg-white dark:bg-gray-950 overflow-hidden'

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-gray-50 dark:bg-gray-900/50 shrink-0">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="h-7 w-[120px] text-xs border-none bg-transparent shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Line Numbers Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs ${showLineNumbers ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
          onClick={() => setShowLineNumbers(!showLineNumbers)}
        >
          {showLineNumbers ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
          <span className="hidden sm:inline">Lines</span>
        </Button>

        {/* Word Wrap Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs ${wordWrap ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
          onClick={() => setWordWrap(!wordWrap)}
        >
          <WrapText className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Wrap</span>
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* Font Size */}
        <div className="flex items-center gap-0.5">
          <Type className="h-3 w-3 text-muted-foreground mr-1" />
          {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
            <Button
              key={size}
              variant={fontSize === size ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-6 w-6 p-0 text-[10px] ${fontSize === size ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}`}
              onClick={() => setFontSize(size)}
            >
              {fontSizes[size].label}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Edit Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs ${editMode ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-muted-foreground'}`}
          onClick={() => setEditMode(!editMode)}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">{editMode ? 'Editing' : 'Edit'}</span>
        </Button>

        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 text-xs ${showSearch ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
          onClick={() => {
            setShowSearch(!showSearch)
            if (!showSearch) {
              setTimeout(() => searchInputRef.current?.focus(), 100)
            } else {
              setSearchQuery('')
            }
          }}
        >
          <Search className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Find</span>
          <kbd className="ml-1 hidden lg:inline text-[9px] bg-muted px-1 rounded">Ctrl+F</kbd>
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Download</span>
        </Button>

        <Button
          variant={copied ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-7 px-2 text-xs ${copied ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={handleCopy}
        >
          {copied ? (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="flex items-center"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Copied!
            </motion.span>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <><Minimize2 className="h-3.5 w-3.5 mr-1" /> <span className="hidden sm:inline">Exit</span></>
          ) : (
            <><Maximize2 className="h-3.5 w-3.5 mr-1" /> <span className="hidden sm:inline">Full</span></>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handlePrevSearch()
                    else handleNextSearch()
                  }
                }}
                placeholder="Search in code..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {searchMatches.length > 0 ? `${searchMatchIndex + 1}/${searchMatches.length}` : 'No results'}
                </span>
              )}
              {searchMatches.length > 1 && (
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-xs" onClick={handlePrevSearch}>
                    ↑
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-xs" onClick={handleNextSearch}>
                    ↓
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => { setShowSearch(false); setSearchQuery('') }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Area */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {editMode ? (
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="relative">
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full min-h-[600px] p-4 font-mono bg-[#282c34] text-gray-100 resize-none outline-none"
                style={{
                  fontSize: fontSizes[fontSize].size,
                  lineHeight: 1.6,
                  tabSize: 4,
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                  wordBreak: wordWrap ? 'break-all' : 'normal',
                  overflowWrap: wordWrap ? 'break-word' : 'normal',
                }}
                spellCheck={false}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full">
            <div ref={scrollRef} className="flex-1 overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 100px)' : '600px' }}>
              <SyntaxHighlighter
                language={lang}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: fontSizes[fontSize].size,
                  minHeight: isFullscreen ? 'calc(100vh - 100px)' : '600px',
                  background: '#282c34',
                }}
                showLineNumbers={showLineNumbers}
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: '#4b5563',
                  background: '#1e1e2e',
                  borderRight: '1px solid #374151',
                }}
                wrapLines={wordWrap}
                wrapLongLines={wordWrap}
              >
                {displayCode}
              </SyntaxHighlighter>
            </div>
            {/* Minimap */}
            {!editMode && (
              <Minimap code={displayCode} scrollRef={scrollRef} />
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t bg-gray-100 dark:bg-gray-900/80 shrink-0">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            <span className="capitalize">{lang}</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <span>{lineCount} lines</span>
          <Separator orientation="vertical" className="h-3" />
          <span>{charCount.toLocaleString()} chars</span>
          {editMode && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-amber-600 border-amber-300 dark:border-amber-700">
                Editing
              </Badge>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {searchQuery && searchMatches.length > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {searchMatches.length} match{searchMatches.length !== 1 ? 'es' : ''}
            </span>
          )}
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}
