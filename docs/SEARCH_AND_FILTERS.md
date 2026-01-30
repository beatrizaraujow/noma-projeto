# Search & Filters Foundation

This document describes the implementation of the Search & Filters Foundation feature set.

## Features

### 1. Full-Text Search (PostgreSQL)

#### Backend Implementation

**Location:** `apps/api/src/modules/search/`

- **Search Service** (`search.service.ts`): Implements PostgreSQL full-text search using Prisma
  - Searches across tasks, projects, and comments
  - Supports workspace-based filtering
  - Uses case-insensitive pattern matching
  - Returns relevant results with associated metadata

- **Search Controller** (`search.controller.ts`): RESTful API endpoint
  - `GET /search?query=<term>&entityType=<type>&workspaceId=<id>&limit=<n>&offset=<n>`
  - Protected by JWT authentication
  - Supports pagination

**Search Capabilities:**
- Tasks: Searches in title and description
- Projects: Searches in name and description
- Comments: Searches in content
- Workspace-scoped results (user only sees what they have access to)

#### Frontend Implementation

**Location:** `apps/web/src/components/SearchModal.tsx`

- **SearchModal Component**: Full-featured search modal with:
  - Real-time search with debouncing (300ms)
  - Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
  - Grouped results by entity type
  - Quick navigation to search results
  - Visual feedback and loading states

- **useSearchShortcut Hook**: Global keyboard shortcut handler
  - Triggers with `Ctrl+K` or `Cmd+K`
  - Can be used anywhere in the application

**API Routes:**
- `apps/web/src/app/api/search/route.ts`: Next.js API route that proxies to backend API

### 2. Advanced Filters

#### Backend Implementation

**Location:** `apps/api/src/modules/tasks/`

- **TaskFilterDto** (`dto/task-filter.dto.ts`): Comprehensive filter options
  - Status filter (multiple selection)
  - Priority filter (multiple selection)
  - Assignee filter (multiple users)
  - Due date range (from/to)
  - Search text
  - Sort options (field and order)

- **Tasks Service Enhancement**: New `findWithFilters` method
  - Builds dynamic Prisma queries based on filters
  - Supports workspace-scoped queries
  - Combines multiple filter criteria
  - Returns enriched task data

- **Tasks Controller Update**: New endpoint
  - `POST /tasks/filter` - Accepts filter criteria in request body

#### Frontend Implementation

**Location:** `apps/web/src/components/TaskFiltersPanel.tsx`

- **TaskFiltersPanel Component**: Comprehensive filter UI
  - Status filter with visual indicators
  - Priority filter with color coding
  - Assignee multi-select with avatars
  - Due date range picker
  - Sort options (field + order)
  - Active filter count badge
  - Clear all filters option

**Features:**
- Visual feedback for active filters
- Collapsible panel with dropdown
- Save filter option (integrated with saved filters)
- Responsive design

### 3. Saved Filters

#### Backend Implementation

**Location:** `apps/api/src/modules/saved-filters/`

- **Database Model** (`packages/database/prisma/schema.prisma`):
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

- **Saved Filters Service** (`saved-filters.service.ts`): Full CRUD operations
  - Create saved filter
  - List user's filters (including public filters)
  - Get filter by ID with access control
  - Update filter (owner only)
  - Delete filter (owner only)

- **Saved Filters Controller** (`saved-filters.controller.ts`): RESTful API
  - `GET /saved-filters` - List filters
  - `POST /saved-filters` - Create filter
  - `GET /saved-filters/:id` - Get specific filter
  - `PUT /saved-filters/:id` - Update filter
  - `DELETE /saved-filters/:id` - Delete filter

#### Frontend Implementation

**Location:** `apps/web/src/components/SavedFilters.tsx`

- **SavedFilters Component**: Manage saved filters
  - List all saved filters
  - Create new filter from current state
  - Edit filter name/description
  - Delete filters
  - Apply saved filter (one-click)
  - Public/private filter indicator

- **useSaveFilter Hook**: Helper hook for saving filters programmatically

**API Routes:**
- `apps/web/src/app/api/saved-filters/route.ts`: List and create
- `apps/web/src/app/api/saved-filters/[id]/route.ts`: Get, update, delete

### 4. Keyboard Shortcuts

#### Implementation

**Location:** `apps/web/src/components/`

- **SearchModal**: Integrated keyboard shortcuts
  - `Ctrl+K` / `Cmd+K`: Open search
  - `↑` / `↓`: Navigate results
  - `Enter`: Select result
  - `Esc`: Close modal

- **KeyboardShortcutsGuide**: Comprehensive shortcuts guide
  - Categorized shortcuts (Navigation, Tasks, Filters, View)
  - Visual key representation
  - `Ctrl+/` to open guide

**Available Shortcuts:**

**Navigation:**
- `Ctrl+K`: Open global search
- `Ctrl+B`: Toggle sidebar
- `Ctrl+P`: Quick project switcher
- `Ctrl+/`: Show keyboard shortcuts

**Tasks:**
- `C`: Create new task
- `E`: Edit selected task
- `Delete`: Delete selected task
- `Ctrl+Enter`: Save task
- `Esc`: Cancel/Close

**Filters:**
- `F`: Focus filters
- `Ctrl+Shift+F`: Clear all filters
- `Ctrl+S`: Save current filter

**View:**
- `1`: Board view
- `2`: List view
- `3`: Calendar view

## Integration

### Backend Integration

The search and saved filters modules are integrated into the main API module:

**File:** `apps/api/src/app.module.ts`
```typescript
import { SearchModule } from './modules/search/search.module';
import { SavedFiltersModule } from './modules/saved-filters/saved-filters.module';

@Module({
  imports: [
    // ... other modules
    SearchModule,
    SavedFiltersModule,
  ],
})
export class AppModule {}
```

### Frontend Integration

The global search is integrated into the root layout:

**File:** `apps/web/src/app/layout.tsx`
```typescript
import { GlobalSearch } from '@/components/GlobalSearch';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <GlobalSearch />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## Usage Examples

### Using Search

```typescript
// The search is always available via Ctrl+K
// Or use the hook in any component:
import { useSearchShortcut } from '@/components/SearchModal';

function MyComponent() {
  const { isOpen, setIsOpen } = useSearchShortcut();
  
  return (
    <button onClick={() => setIsOpen(true)}>
      Open Search
    </button>
  );
}
```

### Using Filters

```typescript
import { TaskFiltersPanel } from '@/components/TaskFiltersPanel';
import { useState } from 'react';

function TasksPage() {
  const [filters, setFilters] = useState({});
  const [tasks, setTasks] = useState([]);

  const applyFilters = async (newFilters) => {
    setFilters(newFilters);
    
    const response = await fetch('/api/tasks/filter', {
      method: 'POST',
      body: JSON.stringify(newFilters),
    });
    
    const data = await response.json();
    setTasks(data);
  };

  return (
    <div>
      <TaskFiltersPanel
        filters={filters}
        onChange={applyFilters}
        users={projectMembers}
      />
      {/* Task list */}
    </div>
  );
}
```

### Using Saved Filters

```typescript
import { SavedFilters } from '@/components/SavedFilters';

function TasksPage() {
  const handleApplyFilter = (filters) => {
    // Apply the saved filter configuration
    setCurrentFilters(filters);
    loadTasksWithFilters(filters);
  };

  return (
    <SavedFilters
      workspaceId={currentWorkspace.id}
      entityType="task"
      onApplyFilter={handleApplyFilter}
    />
  );
}
```

## Database Migration

To apply the database schema changes:

```bash
cd packages/database
npx prisma migrate dev --name add_saved_filters
npx prisma generate
```

## API Documentation

### Search Endpoint

**Request:**
```
GET /search?query=feature&entityType=task&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "tasks": [...],
  "projects": [...],
  "comments": [...]
}
```

### Filter Tasks Endpoint

**Request:**
```
POST /tasks/filter
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": ["TODO", "IN_PROGRESS"],
  "priority": ["HIGH", "URGENT"],
  "assigneeIds": ["user1", "user2"],
  "dueDateFrom": "2026-01-01",
  "dueDateTo": "2026-12-31",
  "sortBy": "dueDate",
  "sortOrder": "asc"
}
```

### Saved Filters Endpoints

**Create:**
```
POST /saved-filters
{
  "name": "High Priority Tasks",
  "description": "All high priority tasks",
  "entityType": "task",
  "filters": { "priority": ["HIGH", "URGENT"] },
  "workspaceId": "workspace123",
  "isPublic": false
}
```

**List:**
```
GET /saved-filters?workspaceId=workspace123&entityType=task
```

**Update:**
```
PUT /saved-filters/:id
{
  "name": "Updated Name",
  "filters": { ... }
}
```

**Delete:**
```
DELETE /saved-filters/:id
```

## Performance Considerations

1. **Search Debouncing**: Search input is debounced by 300ms to reduce API calls
2. **Pagination**: Search and filter results support pagination
3. **Workspace Scoping**: All queries are scoped to user's accessible workspaces
4. **Index Optimization**: Database indices on commonly queried fields (workspaceId, assigneeId, etc.)

## Future Enhancements

1. **PostgreSQL Full-Text Search**: Implement `tsvector` and `tsquery` for advanced full-text search
2. **Search Highlighting**: Highlight matched terms in search results
3. **Recent Searches**: Store and display recent search queries
4. **Filter Presets**: Quick filter buttons for common scenarios
5. **Bulk Operations**: Apply actions to filtered results
6. **Export**: Export filtered results to CSV/JSON
7. **Advanced Search Syntax**: Support for operators (AND, OR, NOT)
8. **Fuzzy Search**: Implement fuzzy matching for typos

## Testing

To test the features:

1. Start the backend: `pnpm --filter api dev`
2. Start the frontend: `pnpm --filter web dev`
3. Press `Ctrl+K` to open search
4. Press `Ctrl+/` to see all keyboard shortcuts
5. Navigate to a project page to see filters
6. Create and save filters for quick access

## Troubleshooting

**Search not working:**
- Check that the API is running
- Verify authentication token is valid
- Check browser console for errors

**Filters not applying:**
- Ensure filter values match the expected enum values
- Check network tab for API errors
- Verify workspace permissions

**Keyboard shortcuts not working:**
- Check if input fields are focused (shortcuts are disabled in inputs)
- Try refreshing the page
- Check browser console for JavaScript errors
