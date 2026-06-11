# Task 3: Collections UI Agent

## Task Summary
Add Collections UI and Bookmark buttons across the Humain-Uno application.

## Work Completed

### 1. Agent Card (src/components/agents/agent-card.tsx)
- Added spring bounce animation to bookmark toggle button
- `bookmarkAnim` state triggers scale keyframes [1, 1.3, 0.9, 1.1, 1] over 400ms
- Applied to both grid and list view bookmark buttons
- `whileTap` changed from scale 0.8 to 0.7 for snappier feel

### 2. Detail View (src/components/views/detail-view.tsx)
- Added `Save` button with Bookmark/BookmarkCheck icon next to Star button
- Bookmark button has animated bounce on toggle (scale [1, 1.15, 0.95, 1.05, 1])
- Styled amber when bookmarked (bg-amber-50, border-amber-300, text-amber-700)
- Added `Collect` dropdown button (FolderPlus icon) with:
  - "Add to Favorites" option (default collection)
  - List of existing custom collections with check marks
  - "Create New Collection" with inline input + Plus button
- Added Save button to floating action bar at bottom of page
- New imports: DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Bookmark, BookmarkCheck, MoreVertical, Plus, FolderPlus
- New state: bookmarkAnim, newCollectionName, showNewCollectionInput
- New handlers: handleBookmarkToggle, handleAddToCollection, handleCreateAndAdd

### 3. Dashboard View (src/components/views/dashboard-view.tsx)
- Updated Overview stat cards: replaced "Private Agents" and "Total Stars" with "Bookmarks" (Heart icon, rose color) and "Collections" (FolderOpen icon, amber color)
- Added Bookmarked Agents Quick View card below Recent Activity:
  - Shows list of bookmarked agents with name and framework badge
  - Click navigates to agent detail view
  - Hover-reveal remove button (X icon, rose color)
  - "View Collections" link navigates to Collections tab
  - "+N more bookmarked" indicator when more than 10
  - max-h-64 with custom scrollbar
- Added `bookmarkedAgents` state and `useEffect` to load bookmarked agent details from API
- Added `toggleBookmark` to store destructuring

### 4. App Layout (src/components/layout/app-layout.tsx)
- Added Bookmarks Quick View Popover in navbar:
  - Bookmark icon button (amber when bookmarks exist, muted otherwise)
  - Count badge (amber-500, white text, shows count or "9+")
  - Popover with bookmarked agents list:
    - Header: "Bookmarked Agents" with count badge
    - "View All" button navigates to Dashboard
    - Each agent: icon, name, framework badge, hover-reveal remove button
    - Empty state with Bookmark icon and instructional text
    - Loading state with spinner
    - "+N more bookmarked" overflow indicator
- Added badge count to Dashboard nav item (amber-500 pill)
- Updated mobile menu to also show badge counts on nav items
- New imports: useCallback, Popover/PopoverContent/PopoverTrigger, Bookmark, X as XIcon, api
- New state: bookmarkAgents, bookmarkLoading
- New callback: loadBookmarkAgents (lazy-loads on popover open)

## Files Modified
- `src/components/agents/agent-card.tsx`
- `src/components/views/detail-view.tsx`
- `src/components/views/dashboard-view.tsx`
- `src/components/layout/app-layout.tsx`

## Verification
- ✅ Lint passes clean (0 errors)
- ✅ Dev server compiles successfully
- ✅ No breaking changes to existing functionality
