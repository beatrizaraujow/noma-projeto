# Quick Start: AI Features Setup

## 🚀 Installation Complete

All AI features have been successfully implemented! Here's what was added:

### ✅ Backend (API)
- AI Module with OpenAI integration
- 6 AI endpoints for intelligent task assistance
- Automatic error handling and fallbacks
- OpenAI SDK installed

### ✅ Frontend (Web)
- AIAssistant hook for all AI operations
- AITaskForm with integrated AI suggestions
- Reusable AI components
- Visual feedback and loading states

## 🔑 Setup Steps

### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add to `apps/api/.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Start Services

```bash
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

### 4. Test AI Features

1. Navigate to any project
2. Click "Create New Task"
3. You'll see AI Assist buttons:
   - ✨ Suggest Title
   - ✨ Enhance Description
   - ✨ Predict Date
   - ✨ Auto-categorize

## 🎯 Available AI Features

### 1. **Auto-Suggest Task Titles**
- Enter basic context
- Get 3 intelligent title suggestions
- Click to apply

### 2. **Smart Due Date Prediction**
- Analyzes task complexity
- Predicts realistic deadlines
- Shows confidence level

### 3. **Description Enhancement**
- Expands basic descriptions
- Generates action steps
- Suggests relevant tags

### 4. **Auto-Categorization**
- Detects task category
- Recommends priority level
- Generates tags

### 5. **Complexity Analysis**
- Estimates hours needed
- Identifies risks
- Provides recommendations

## 📡 API Endpoints

All endpoints require JWT authentication:

```
GET  /ai/status                  - Check if AI is enabled
POST /ai/suggest-title           - Get title suggestions
POST /ai/predict-due-date        - Predict completion date
POST /ai/enhance-description     - Enhance description
POST /ai/categorize-task         - Auto-categorize task
POST /ai/analyze-complexity      - Analyze task complexity
POST /ai/generate-tasks          - Generate task ideas
```

## 💡 Usage Example

```typescript
// Using the AIAssistant hook
import AIAssistant from '@/components/AIAssistant';

function MyComponent() {
  const { token } = useSession();
  const ai = AIAssistant({ token });

  const handleSuggest = async () => {
    const suggestions = await ai.suggestTitle(
      'need to add user authentication',
      'E-commerce Platform'
    );
    console.log(suggestions);
  };

  return (
    <button onClick={handleSuggest} disabled={ai.loading}>
      {ai.loading ? 'Thinking...' : 'Get AI Suggestions'}
    </button>
  );
}
```

## ⚙️ Configuration Options

### Optional Environment Variables

```env
# Use specific OpenAI organization (if applicable)
OPENAI_ORG_ID=org-your-org-id

# Use different model (default: gpt-3.5-turbo)
OPENAI_MODEL=gpt-4
```

## 💰 Cost Estimate

Using GPT-3.5-turbo (recommended):
- **Per request**: ~$0.0003 (0.03 cents)
- **100 requests**: ~$0.03
- **1,000 requests**: ~$0.30

Very cost-effective for small to medium teams!

## 🔒 Security Notes

- ✅ API key stored in environment variables
- ✅ Never committed to version control
- ✅ All requests authenticated via JWT
- ✅ No personal data sent to OpenAI
- ✅ Graceful degradation if API unavailable

## 🐛 Troubleshooting

### AI Features Not Working?

1. **Check API Key**:
   ```bash
   # In apps/api directory
   cat .env | grep OPENAI_API_KEY
   ```

2. **Verify Service Status**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT" http://localhost:3001/ai/status
   ```

3. **Check Server Logs**:
   Look for OpenAI-related errors in terminal

4. **Restart API Server**:
   After adding API key, always restart

### Common Issues

**"AI features are not enabled"**
- API key not configured
- Invalid API key
- Server not restarted after adding key

**"Failed to generate suggestions"**
- OpenAI API rate limit reached
- Network connectivity issues
- Check OpenAI service status

**Slow Responses**
- Normal for AI (2-5 seconds)
- Check internet connection
- Consider upgrading OpenAI plan for faster responses

## 📚 Documentation

Full documentation available in:
- `docs/AI_FEATURES.md` - Complete feature guide
- `apps/api/src/modules/ai/` - Backend implementation
- `apps/web/src/components/AIAssistant.tsx` - Frontend hook
- `apps/web/src/components/AITaskForm.tsx` - Example usage

## 🎉 You're Ready!

AI features are now integrated and ready to use. Simply add your OpenAI API key and start creating smarter tasks!

## 🔮 Coming in Phase 2

- Smart task assignment based on team skills
- Automatic sprint planning
- Dependency detection
- Risk assessment
- Natural language task creation
- Meeting summaries
- And more!

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review full documentation in `docs/AI_FEATURES.md`
3. Check OpenAI API status at [status.openai.com](https://status.openai.com)

---

**Happy AI-powered task management! 🚀✨**
