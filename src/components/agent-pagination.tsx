'use client'

import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react'

// ─── Smart Page Range Generator ───
// Generates an array of page numbers with ellipsis markers
// E.g.: [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 20]
function generatePageRange(currentPage: number, totalPages: number, maxVisible: number = 7): (number | string)[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | string)[] = []
  const halfVisible = Math.floor((maxVisible - 2) / 2) // -2 for first and last page

  // Always include first page
  pages.push(1)

  if (currentPage <= halfVisible + 2) {
    // Near the beginning: 1, 2, 3, 4, 5, ..., 20
    for (let i = 2; i <= Math.min(maxVisible - 2, totalPages - 1); i++) {
      pages.push(i)
    }
    if (totalPages > maxVisible - 1) {
      pages.push('ellipsis-end')
      pages.push(totalPages)
    }
  } else if (currentPage >= totalPages - halfVisible - 1) {
    // Near the end: 1, ..., 16, 17, 18, 19, 20
    pages.push('ellipsis-start')
    for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Middle: 1, ..., 8, 9, 10, ..., 20
    pages.push('ellipsis-start')
    for (let i = currentPage - halfVisible; i <= currentPage + halfVisible; i++) {
      pages.push(i)
    }
    pages.push('ellipsis-end')
    pages.push(totalPages)
  }

  return pages
}

// ─── Items Per Page Options ───
const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48] as const

// ─── Component Props ───
interface AgentPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  showPageSizeSelector?: boolean
  showResultsSummary?: boolean
  className?: string
}

// ─── Main Component ───
export function AgentPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showResultsSummary = true,
  className = '',
}: AgentPaginationProps) {
  if (totalPages <= 0 || totalItems <= 0) return null

  const pageRange = generatePageRange(currentPage, totalPages)
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    onPageChange(page)
  }

  const btnBase = 'inline-flex items-center justify-center size-9 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  const btnGhost = 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
  const btnActive = 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'

  return (
    <div className={cn('mt-8 space-y-4', className)}>
      {/* Results Summary & Page Size Selector */}
      {(showResultsSummary || showPageSizeSelector) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results Summary */}
          {showResultsSummary && (
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">{startIndex}</span>
              {' '}–{' '}
              <span className="font-semibold text-foreground">{endIndex}</span>
              {' '}of{' '}
              <span className="font-semibold text-foreground">{totalItems}</span>
              {' '}agent{totalItems !== 1 ? 's' : ''}
            </p>
          )}

          {/* Page Size Selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page</span>
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => onPageSizeChange(option)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium transition-colors',
                      pageSize === option
                        ? 'bg-emerald-600 text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    aria-label={`Show ${option} items per page`}
                    aria-pressed={pageSize === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center">
        <ul className="flex flex-row items-center gap-1">
          {/* First Page Button */}
          <li>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              className={cn(btnBase, btnGhost)}
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </li>

          {/* Previous Button */}
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={cn(btnBase, 'gap-1 px-2.5 sm:pl-2.5', btnGhost)}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:block">Previous</span>
            </button>
          </li>

          {/* Page Numbers */}
          {pageRange.map((page, idx) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <li key={`ellipsis-${idx}`}>
                  <span aria-hidden className="flex size-9 items-center justify-center">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More pages</span>
                  </span>
                </li>
              )
            }
            const isActive = page === currentPage
            return (
              <li key={page}>
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={cn(btnBase, isActive ? btnActive : btnGhost)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              </li>
            )
          })}

          {/* Next Button */}
          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={cn(btnBase, 'gap-1 px-2.5 sm:pr-2.5', btnGhost)}
              aria-label="Go to next page"
            >
              <span className="hidden sm:block">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>

          {/* Last Page Button */}
          <li>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className={cn(btnBase, btnGhost)}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
