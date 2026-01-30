# Testing Checklist - Search & Filters Foundation

## Prerequisites
- [ ] Database is running (PostgreSQL)
- [ ] Backend API is running (`pnpm --filter api dev`)
- [ ] Frontend is running (`pnpm --filter web dev`)
- [ ] You're logged in with a valid user account

## Database Migration
- [ ] Run `cd packages/database && npx prisma migrate deploy`
- [ ] Run `npx prisma generate`
- [ ] Verify `saved_filters` table exists in database
- [ ] Check indexes are created (userId, workspaceId, entityType)

## 1. Full-Text Search Testing

### Backend API
- [ ] Test search endpoint: `GET http://localhost:3001/search?query=test&entityType=all`
- [ ] Verify authentication required (401 without token)
- [ ] Test with different entity types: `task`, `project`, `comment`, `all`
- [ ] Test pagination: `limit=5&offset=0`
- [ ] Verify workspace scoping (only shows accessible data)

### Frontend
- [ ] Press `Ctrl+K` (or `Cmd+K` on Mac) - search modal opens
- [ ] Type a search query - results appear within 300ms
- [ ] Verify debouncing works (doesn't search on every keystroke)
- [ ] Test with no results - shows "No results found"
- [ ] Test keyboard navigation:
  - [ ] `↑` moves selection up
  - [ ] `↓` moves selection down
  - [ ] `Enter` navigates to selected result
  - [ ] `Esc` closes the modal
- [ ] Verify results are grouped by type (Projects, Tasks, Comments)
- [ ] Click a result - navigates to correct page
- [ ] Verify modal closes after selection

### Search Results Accuracy
- [ ] Create a task with title "Feature Implementation"
- [ ] Search for "feature" - task appears in results
- [ ] Search for "implementation" - task appears in results
- [ ] Search is case-insensitive
- [ ] Partial matches work
- [ ] Search in task descriptions
- [ ] Search in project names
- [ ] Search in comment content

## 2. Advanced Filters Testing

### Backend API
- [ ] Test filter endpoint: `POST http://localhost:3001/tasks/filter`
- [ ] Test status filter: `{ "status": ["TODO", "IN_PROGRESS"] }`
- [ ] Test priority filter: `{ "priority": ["HIGH", "URGENT"] }`
- [ ] Test assignee filter: `{ "assigneeIds": ["user-id"] }`
- [ ] Test date range: `{ "dueDateFrom": "2026-01-01", "dueDateTo": "2026-12-31" }`
- [ ] Test combined filters
- [ ] Test sort options: `{ "sortBy": "dueDate", "sortOrder": "asc" }`
- [ ] Test search within filters: `{ "search": "keyword", "status": ["TODO"] }`

### Frontend
- [ ] Navigate to a project with tasks
- [ ] Click "Filters" button - panel opens
- [ ] Panel shows active filter count badge when filters applied
- [ ] Click status filters:
  - [ ] "To Do" - shows only TODO tasks
  - [ ] Multiple statuses - shows union of results
  - [ ] Status badges have colors
- [ ] Click priority filters:
  - [ ] "High" - shows only high priority
  - [ ] Multiple priorities work
  - [ ] Priority badges have colors
- [ ] Test assignee filter:
  - [ ] Shows list of project members
  - [ ] Checkboxes work
  - [ ] Avatars display
  - [ ] Multiple selection works
- [ ] Test due date filter:
  - [ ] "From" date picker works
  - [ ] "To" date picker works
  - [ ] Range filtering works correctly
- [ ] Test sort options:
  - [ ] Sort by dropdown has all options
  - [ ] Sort order toggle (asc/desc) works
  - [ ] Results reorder correctly
- [ ] Click "Clear all" - all filters reset
- [ ] Active filter count updates correctly
- [ ] Click outside panel - closes properly

## 3. Saved Filters Testing

### Backend API
- [ ] Create filter: `POST http://localhost:3001/saved-filters`
  ```json
  {
    "name": "High Priority ToDos",
    "description": "All high priority tasks to do",
    "entityType": "task",
    "filters": { "status": ["TODO"], "priority": ["HIGH"] },
    "workspaceId": "workspace-id",
    "isPublic": false
  }
  ```
- [ ] List filters: `GET http://localhost:3001/saved-filters?entityType=task`
- [ ] Get specific filter: `GET http://localhost:3001/saved-filters/:id`
- [ ] Update filter: `PUT http://localhost:3001/saved-filters/:id`
- [ ] Delete filter: `DELETE http://localhost:3001/saved-filters/:id`
- [ ] Verify access control (can't update/delete others' filters)
- [ ] Test public filters (visible to all workspace members)

### Frontend
- [ ] Saved Filters section is visible
- [ ] Click "New" to create filter:
  - [ ] Input field for name appears
  - [ ] Input field for description appears
  - [ ] Save button works
  - [ ] Cancel button works
  - [ ] New filter appears in list after saving
- [ ] Saved filters list shows:
  - [ ] Filter name
  - [ ] Description (if any)
  - [ ] Public badge (if public)
  - [ ] Star icon
- [ ] Click a saved filter:
  - [ ] Filters are applied immediately
  - [ ] Task list updates
  - [ ] Filter panel shows correct selections
- [ ] Hover over saved filter:
  - [ ] Edit and delete icons appear
- [ ] Click edit icon:
  - [ ] Name becomes editable
  - [ ] Blur to save
  - [ ] Cancel with X icon
- [ ] Click delete icon:
  - [ ] Filter is removed from list
  - [ ] Confirmed with backend
- [ ] Test with no saved filters:
  - [ ] Shows "No saved filters yet" message

## 4. Keyboard Shortcuts Testing

### Global Shortcuts
- [ ] `Ctrl+K` opens search (from any page)
- [ ] `Cmd+K` works on Mac
- [ ] `Ctrl+/` opens shortcuts guide
- [ ] `Cmd+/` works on Mac
- [ ] Shortcuts don't trigger when typing in input fields
- [ ] `Esc` closes modals

### Search Modal Shortcuts
- [ ] Open search with `Ctrl+K`
- [ ] Type query
- [ ] Press `↓` multiple times - selection moves down
- [ ] Press `↑` - selection moves up
- [ ] Selection wraps (or stops at bounds)
- [ ] `Enter` navigates to selected result
- [ ] `Esc` closes modal

### Shortcuts Guide
- [ ] Press `Ctrl+/` - guide opens
- [ ] Shows all shortcuts categorized:
  - [ ] Navigation section
  - [ ] Tasks section
  - [ ] Filters section
  - [ ] View section
- [ ] Keyboard keys are visually styled (kbd elements)
- [ ] Footer shows hint about `Ctrl+/`
- [ ] Click X button - guide closes
- [ ] Press `Esc` - guide closes
- [ ] Shortcuts are platform-aware (Ctrl vs Cmd)

## 5. Integration Testing

### Search + Filters
- [ ] Apply filters on tasks page
- [ ] Open search with `Ctrl+K`
- [ ] Search results respect current workspace
- [ ] Navigate to result maintains context

### Saved Filters + Active Filters
- [ ] Apply some filters manually
- [ ] Save as new filter
- [ ] Clear all filters
- [ ] Load saved filter
- [ ] Filters restore exactly as saved

### Multiple Workspaces
- [ ] Switch to different workspace
- [ ] Search results change to new workspace
- [ ] Saved filters list changes
- [ ] Filters respect new workspace context

## 6. Performance Testing

### Search Performance
- [ ] Search responds within 500ms
- [ ] Debouncing prevents excessive API calls
- [ ] Large result sets don't freeze UI
- [ ] Results load progressively (if paginated)

### Filter Performance
- [ ] Filter changes update quickly (<300ms)
- [ ] Multiple filter changes don't cause lag
- [ ] Large task lists filter smoothly
- [ ] Sort changes are instant

### Saved Filters Performance
- [ ] List loads quickly (<500ms)
- [ ] Create/update operations are fast
- [ ] No lag when applying saved filter

## 7. Error Handling

### Network Errors
- [ ] Disconnect network - graceful error message
- [ ] Slow network - shows loading state
- [ ] Timeout - shows error message
- [ ] Retry mechanism works

### API Errors
- [ ] 401 Unauthorized - redirects to login
- [ ] 403 Forbidden - shows access denied
- [ ] 404 Not Found - shows not found message
- [ ] 500 Server Error - shows error message

### Validation Errors
- [ ] Empty filter name - shows validation error
- [ ] Invalid date range - shows validation error
- [ ] Invalid filter values - rejected by backend

## 8. UI/UX Testing

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768px width)
- [ ] Mobile view (if applicable)

### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible
- [ ] Color contrast meets standards
- [ ] Screen reader friendly (test with NVDA/JAWS)

### Visual Design
- [ ] Consistent with app design system
- [ ] Icons load correctly
- [ ] Colors match brand
- [ ] Spacing is consistent
- [ ] Loading states are clear
- [ ] Empty states are informative

## 9. Edge Cases

### Search
- [ ] Search with empty query
- [ ] Search with special characters (@#$%^&*)
- [ ] Search with very long query (>100 chars)
- [ ] Search with SQL-like syntax (injection test)
- [ ] Search in empty workspace
- [ ] Search with no permissions

### Filters
- [ ] Apply all filters at once
- [ ] Clear filters multiple times
- [ ] Switch between views with filters active
- [ ] Apply filters with no matching results
- [ ] Extreme date ranges
- [ ] Filter by non-existent user

### Saved Filters
- [ ] Create filter with same name as existing
- [ ] Create 50+ saved filters (pagination)
- [ ] Delete filter while it's active
- [ ] Update filter while using it
- [ ] Share filter between users
- [ ] Filter without workspace

## 10. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (if applicable)

## Documentation Verification

- [ ] Quick Start guide is accurate
- [ ] Full documentation is comprehensive
- [ ] API examples work as documented
- [ ] Code examples are correct
- [ ] Troubleshooting section is helpful

## Final Checklist

- [ ] All backend tests pass
- [ ] All frontend tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Documentation updated
- [ ] README updated
- [ ] CHANGELOG updated

---

## Notes & Issues Found

_Use this section to track any bugs or issues discovered during testing:_

1. 
2. 
3. 

---

## Sign-off

- [ ] Tested by: ________________
- [ ] Date: ________________
- [ ] Build/Version: ________________
- [ ] All critical issues resolved: Yes/No
- [ ] Ready for production: Yes/No

---

**Testing Complete! 🎉**
