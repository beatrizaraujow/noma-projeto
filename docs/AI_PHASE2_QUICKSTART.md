# AI Features - Phase 2 Quick Start

## Overview
Phase 2 adds 5 advanced AI features:
1. **Project Summary** - AI-powered project insights
2. **Meeting Notes → Tasks** - Automatic action item extraction
3. **Epic Breakdown** - Smart task decomposition
4. **Sentiment Analysis** - Team morale tracking
5. **Risk Detection** - Proactive risk identification

## Backend Endpoints (Already Implemented)

### 1. Project Summary
```bash
POST /ai/summarize-project
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project description",
  "tasks": [
    { "title": "Task 1", "status": "done", "priority": "high" },
    { "title": "Task 2", "status": "in_progress" }
  ]
}
```

### 2. Meeting Notes → Tasks
```bash
POST /ai/meeting-to-tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "meetingNotes": "John will implement login by Friday. Sarah needs to review API docs."
}
```

### 3. Epic Breakdown
```bash
POST /ai/breakdown-epic
Authorization: Bearer {token}
Content-Type: application/json

{
  "epicTitle": "Implement authentication system",
  "epicDescription": "Complete auth with JWT and OAuth",
  "projectContext": "E-commerce Platform"
}
```

### 4. Sentiment Analysis
```bash
POST /ai/analyze-sentiment
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Great progress this week! Team is working well together.",
  "context": "Weekly status update"
}
```

### 5. Risk Detection
```bash
POST /ai/detect-risks
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Project Name",
  "tasks": [
    { 
      "title": "Task", 
      "status": "in_progress", 
      "priority": "high",
      "dueDate": "2026-01-15"
    }
  ],
  "comments": ["Blocked on API access"]
}
```

## Frontend Components (Already Created)

### 1. ProjectSummary Component
```tsx
import ProjectSummary from '@/components/ProjectSummary';

<ProjectSummary
  projectId={project.id}
  projectName={project.name}
  projectDescription={project.description}
  tasks={project.tasks}
  token={userToken}
/>
```

**Features**:
- One-click summary generation
- Visual metrics (total, completed, active tasks)
- Key insights list
- Actionable recommendations

### 2. MeetingNotesConverter Component
```tsx
import MeetingNotesConverter from '@/components/MeetingNotesConverter';

<MeetingNotesConverter
  token={userToken}
  onTasksGenerated={(tasks) => {
    // Handle generated tasks
    tasks.forEach(task => createTask(task));
  }}
/>
```

**Features**:
- Large textarea for meeting notes
- Auto-detection of action items, assignees, dates
- Priority assignment
- Task preview before creation

### 3. EpicBreakdown Component
```tsx
import EpicBreakdown from '@/components/EpicBreakdown';

<EpicBreakdown
  token={userToken}
  projectContext={project.name}
  onSubtasksGenerated={(subtasks) => {
    // Create subtasks in project
    createMultipleSubtasks(subtasks);
  }}
/>
```

**Features**:
- Epic title and description input
- Automatic subtask generation
- Time estimation per subtask
- Dependency mapping
- Risk warnings

### 4. SentimentAnalysis Component
```tsx
import SentimentAnalysis from '@/components/SentimentAnalysis';

// Analyze existing comment
<SentimentAnalysis
  text={comment.text}
  context="Project comment"
  token={userToken}
  onAnalysisComplete={(analysis) => {
    // Store sentiment data
    updateCommentSentiment(comment.id, analysis);
  }}
/>

// Or let user enter text
<SentimentAnalysis
  token={userToken}
  onAnalysisComplete={(analysis) => console.log(analysis)}
/>
```

**Features**:
- Positive/Neutral/Negative classification
- Score visualization (-1 to +1)
- Emotion detection badges
- Concern extraction

### 5. RiskDetector Component
```tsx
import RiskDetector from '@/components/RiskDetector';

<RiskDetector
  projectName={project.name}
  tasks={project.tasks}
  activities={project.activities}
  comments={project.comments}
  token={userToken}
/>
```

**Features**:
- Overall risk score (0-100)
- Risk type classification (delay/blocker/resource/technical)
- Severity levels (low/medium/high)
- Mitigation strategies
- Color-coded alerts

## Integration Examples

### Add to Project Dashboard
```tsx
// apps/web/src/app/projects/[id]/page.tsx
import ProjectSummary from '@/components/ProjectSummary';
import RiskDetector from '@/components/RiskDetector';

export default function ProjectPage({ params }) {
  const { project, tasks } = useProject(params.id);
  const { token } = useAuth();

  return (
    <div className="space-y-6">
      {/* Existing project content */}
      
      {/* AI Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectSummary
          projectId={project.id}
          projectName={project.name}
          projectDescription={project.description}
          tasks={tasks}
          token={token}
        />
        
        <RiskDetector
          projectName={project.name}
          tasks={tasks}
          token={token}
        />
      </div>
    </div>
  );
}
```

### Add Meeting Notes Converter
```tsx
// apps/web/src/app/projects/[id]/meetings/page.tsx
import MeetingNotesConverter from '@/components/MeetingNotesConverter';

export default function MeetingsPage({ params }) {
  const { token } = useAuth();
  const { createTask } = useProject(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Meeting Notes</h1>
      
      <MeetingNotesConverter
        token={token}
        onTasksGenerated={async (tasks) => {
          // Create tasks in project
          for (const task of tasks) {
            await createTask({
              title: task.title,
              description: task.description,
              priority: task.priority,
              assignee: task.assignee,
            });
          }
        }}
      />
    </div>
  );
}
```

### Add Epic Breakdown to Task Creation
```tsx
// apps/web/src/components/CreateTaskModal.tsx
import { useState } from 'react';
import EpicBreakdown from '@/components/EpicBreakdown';

export default function CreateTaskModal({ projectId, token }) {
  const [showEpicBreakdown, setShowEpicBreakdown] = useState(false);

  return (
    <Modal>
      <Button onClick={() => setShowEpicBreakdown(true)}>
        Break Down Epic
      </Button>
      
      {showEpicBreakdown && (
        <EpicBreakdown
          token={token}
          projectContext={projectName}
          onSubtasksGenerated={(subtasks) => {
            // Create all subtasks
            createMultipleTasks(subtasks);
            setShowEpicBreakdown(false);
          }}
        />
      )}
    </Modal>
  );
}
```

### Add Sentiment Analysis to Comments
```tsx
// apps/web/src/components/CommentsList.tsx
import SentimentAnalysis from '@/components/SentimentAnalysis';

export default function CommentsList({ comments, token }) {
  const [analyzingComment, setAnalyzingComment] = useState(null);

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id} className="border p-4 rounded">
          <p>{comment.text}</p>
          
          {comment.sentiment && (
            <SentimentBadge sentiment={comment.sentiment} />
          )}
          
          <Button onClick={() => setAnalyzingComment(comment.id)}>
            Analyze Sentiment
          </Button>
          
          {analyzingComment === comment.id && (
            <SentimentAnalysis
              text={comment.text}
              context="Comment"
              token={token}
              onAnalysisComplete={(analysis) => {
                updateCommentSentiment(comment.id, analysis);
                setAnalyzingComment(null);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

## Testing

### 1. Test Project Summary
```bash
# Get project data from your API
curl -X GET http://localhost:3001/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate summary
curl -X POST http://localhost:3001/ai/summarize-project \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "tasks": [
      {"title": "Setup", "status": "done"},
      {"title": "Development", "status": "in_progress"}
    ]
  }'
```

### 2. Test Meeting Notes
```bash
curl -X POST http://localhost:3001/ai/meeting-to-tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingNotes": "John will fix the login bug by EOD. Sarah needs to review the PR. We decided to use React Query."
  }'
```

### 3. Test Sentiment
```bash
curl -X POST http://localhost:3001/ai/analyze-sentiment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is taking way too long and I am very frustrated with the blockers",
    "context": "Project comment"
  }'
```

## Cost Considerations

Each Phase 2 feature uses more tokens than Phase 1:

- **Project Summary**: ~500-800 tokens per request
- **Meeting Notes**: ~300-600 tokens per request
- **Epic Breakdown**: ~600-1000 tokens per request
- **Sentiment Analysis**: ~200-400 tokens per request
- **Risk Detection**: ~500-800 tokens per request

**Estimated Costs** (GPT-3.5-turbo at $0.001/1K tokens):
- Project Summary: ~$0.0005-0.0008 per request
- Meeting Notes: ~$0.0003-0.0006 per request
- Epic Breakdown: ~$0.0006-0.001 per request
- Sentiment Analysis: ~$0.0002-0.0004 per request
- Risk Detection: ~$0.0005-0.0008 per request

**Monthly estimate** (100 users, moderate usage):
- ~$30-50/month for all Phase 2 features

## Next Steps

1. ✅ Backend implemented (ai.service.ts, ai.controller.ts)
2. ✅ Frontend components created
3. 🔄 Integrate components into your UI
4. 🔄 Add to project dashboards
5. 🔄 Test with real project data
6. 🔄 Monitor usage and costs
7. 🔄 Gather user feedback
8. 🔄 Consider caching frequently accessed summaries

## Troubleshooting

### AI Service Not Enabled
- Verify `OPENAI_API_KEY` in `apps/api/.env`
- Check `/ai/status` endpoint

### High Latency
- Responses take 2-5 seconds (normal for OpenAI)
- Consider adding loading states
- Cache results where appropriate

### Rate Limits
- Free tier: 3 req/min
- Add request queuing
- Implement user-based rate limiting

### Component Errors
```bash
# Check imports
pnpm --filter @nexora/ui build

# Verify button/card/input components exist
ls apps/web/node_modules/@nexora/ui/components/
```

## Support

- [AI Features Complete Guide](./AI_FEATURES.md)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Project Issues](https://github.com/your-repo/issues)
