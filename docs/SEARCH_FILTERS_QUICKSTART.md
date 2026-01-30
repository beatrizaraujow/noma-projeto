# Search & Filters - Quick Start Guide

## 🎯 Overview

You now have a complete **Search & Filters Foundation** implemented with:

✅ Full-text search across tasks, projects, and comments  
✅ Advanced filters with multiple criteria  
✅ Saved filters for quick access  
✅ Keyboard shortcuts for power users  

## 🚀 Quick Setup

### 1. Run Database Migration

```bash
cd packages/database
npx prisma migrate deploy
npx prisma generate
```

### 2. Start the Application

```bash
# Terminal 1 - Backend API
pnpm --filter api dev

# Terminal 2 - Frontend
pnpm --filter web dev
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open global search |
| `Ctrl+/` / `Cmd+/` | Show all shortcuts |
| `↑` `↓` | Navigate search results |
| `Enter` | Select result |
| `Esc` | Close modal |

## 🔍 Using Search

### From Anywhere in the App
1. Press **Ctrl+K** (or **Cmd+K** on Mac)
2. Type your search query
3. See instant results from tasks, projects, and comments
4. Use arrow keys to navigate
5. Press Enter to jump to result

### Search API Endpoint
```bash
GET /search?query=feature&entityType=task&limit=10
```

## 🎛️ Using Filters

### In Task Views
1. Click the **"Filters"** button
2. Select your filter criteria:
   - Status (To Do, In Progress, etc.)
   - Priority (Low, Medium, High, Urgent)
   - Assignees
   - Due date range
   - Sort options
3. Results update automatically

### Filter Tasks API Endpoint
```bash
POST /tasks/filter
{
  "status": ["TODO", "IN_PROGRESS"],
  "priority": ["HIGH"],
  "assigneeIds": ["user-id"],
  "dueDateFrom": "2026-01-01",
  "sortBy": "dueDate",
  "sortOrder": "asc"
}
```

## 💾 Saved Filters

### Save a Filter
1. Apply your desired filters
2. Click the **"Save"** button in the filters panel
3. Give it a name and description
4. Access it anytime from the Saved Filters list

### Manage Saved Filters
- **Apply**: Click on any saved filter to instantly apply it
- **Edit**: Click the edit icon to rename
- **Delete**: Click the trash icon to remove
- **Public**: Mark filters as public to share with your team

## 📂 File Structure

### Backend (API)
```
apps/api/src/modules/
├── search/
│   ├── search.module.ts
│   ├── search.controller.ts
│   ├── search.service.ts
│   └── dto/
│       └── search.dto.ts
├── saved-filters/
│   ├── saved-filters.module.ts
│   ├── saved-filters.controller.ts
│   ├── saved-filters.service.ts
│   └── dto/
│       └── saved-filter.dto.ts
└── tasks/
    └── dto/
        └── task-filter.dto.ts
```

### Frontend (Web)
```
apps/web/src/
├── components/
│   ├── SearchModal.tsx           # Global search with Ctrl+K
│   ├── GlobalSearch.tsx          # Search wrapper
│   ├── TaskFiltersPanel.tsx      # Advanced filters UI
│   ├── SavedFilters.tsx          # Saved filters management
│   └── KeyboardShortcutsGuide.tsx # Shortcuts help
└── app/
    └── api/
        ├── search/
        │   └── route.ts
        └── saved-filters/
            ├── route.ts
            └── [id]/
                └── route.ts
```

## 🎨 Component Usage Examples

### Global Search
```tsx
import { SearchModal, useSearchShortcut } from '@/components/SearchModal';

function MyComponent() {
  const { isOpen, setIsOpen } = useSearchShortcut();
  
  return <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
```

### Task Filters
```tsx
import { TaskFiltersPanel } from '@/components/TaskFiltersPanel';

function TasksView() {
  const [filters, setFilters] = useState({});
  
  return (
    <TaskFiltersPanel
      filters={filters}
      onChange={setFilters}
      users={projectMembers}
    />
  );
}
```

### Saved Filters
```tsx
import { SavedFilters } from '@/components/SavedFilters';

function TasksView() {
  return (
    <SavedFilters
      workspaceId={workspace.id}
      entityType="task"
      onApplyFilter={applyFilters}
    />
  );
}
```

## 🧪 Testing

### Test Search
1. Create some tasks with different titles
2. Press `Ctrl+K`
3. Type part of a task title
4. Verify results appear instantly

### Test Filters
1. Go to a project with multiple tasks
2. Open filters panel
3. Select "High Priority" and "In Progress"
4. Verify only matching tasks appear

### Test Saved Filters
1. Apply some filters
2. Save the filter with a name
3. Clear filters
4. Click the saved filter
5. Verify filters are restored

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env)
DATABASE_URL="postgresql://..."

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 📊 Database Schema

### SavedFilter Model
```prisma
model SavedFilter {
  id          String   @id @default(cuid())
  name        String
  description String?
  entityType  String   // 'task', 'project', 'activity'
  filters     Json     // Filter configuration
  userId      String
  workspaceId String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🐛 Troubleshooting

### Search not working
- ✓ Check API is running on port 3001
- ✓ Verify you're logged in
- ✓ Check browser console for errors

### Filters not applying
- ✓ Ensure backend is running
- ✓ Check filter values match expected enums
- ✓ Verify workspace permissions

### Keyboard shortcuts not responding
- ✓ Make sure no input field is focused
- ✓ Try refreshing the page
- ✓ Check if browser extensions are blocking events

## 📚 Additional Resources

- [Full Documentation](./SEARCH_AND_FILTERS.md)
- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🎉 What's Next?

Consider implementing:
- 🔍 PostgreSQL `tsvector` for advanced full-text search
- 🎨 Search result highlighting
- 📝 Recent searches history
- 📤 Export filtered results
- 🤖 Smart filter suggestions
- 🔔 Saved search notifications

---

**Questions?** Check the full documentation or open an issue!
