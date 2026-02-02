import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: string;
  estimatedDuration?: string;
}

export interface DueDatePrediction {
  suggestedDate: Date;
  confidence: number;
  reasoning: string;
}

export interface TaskEnhancement {
  enhancedDescription: string;
  suggestedSteps: string[];
  tags: string[];
}

export interface TaskCategorization {
  category: string;
  priority: string;
  tags: string[];
  confidence: number;
}

export interface ProjectSummary {
  overview: string;
  progress: string;
  keyMetrics: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface MeetingTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

export interface EpicBreakdown {
  subtasks: {
    title: string;
    description: string;
    estimatedHours: number;
    dependencies: string[];
  }[];
  timeline: string;
  risks: string[];
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  emotions: string[];
  concerns: string[];
}

export interface RiskDetection {
  risks: {
    type: 'delay' | 'blocker' | 'resource' | 'technical';
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }[];
  overallRiskScore: number;
  recommendations: string[];
}

@Injectable()
export class AIService {
  private openai: OpenAI;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.enabled = !!apiKey;
    
    if (this.enabled) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async suggestTaskTitle(context: string, projectName?: string): Promise<string[]> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Given the following context${projectName ? ` for project "${projectName}"` : ''}, suggest 3 concise and clear task titles (max 60 characters each):

Context: ${context}

Return only the task titles, one per line, without numbering or bullets.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that suggests clear, actionable task titles for project management.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const suggestions = response.choices[0].message.content
        ?.split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.trim())
        .slice(0, 3) || [];

      return suggestions;
    } catch (error) {
      console.error('Error suggesting task titles:', error);
      throw new Error('Failed to generate task title suggestions');
    }
  }

  async predictDueDate(
    taskTitle: string,
    taskDescription?: string,
    projectContext?: string
  ): Promise<DueDatePrediction> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Analyze this task and predict a reasonable due date:

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}
${projectContext ? `Project Context: ${projectContext}` : ''}

Estimate how many days from now this task should be completed. Consider:
- Task complexity
- Typical project timelines
- Buffer time for unexpected issues

Respond in JSON format:
{
  "daysFromNow": <number>,
  "confidence": <0-100>,
  "reasoning": "<brief explanation>"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management expert who predicts realistic task completion timelines.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const suggestedDate = new Date();
      suggestedDate.setDate(suggestedDate.getDate() + (result.daysFromNow || 7));

      return {
        suggestedDate,
        confidence: result.confidence || 50,
        reasoning: result.reasoning || 'Based on typical task complexity',
      };
    } catch (error) {
      console.error('Error predicting due date:', error);
      // Return default prediction
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      return {
        suggestedDate: defaultDate,
        confidence: 30,
        reasoning: 'Default estimate (AI unavailable)',
      };
    }
  }

  async enhanceTaskDescription(
    title: string,
    currentDescription?: string
  ): Promise<TaskEnhancement> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Enhance this task description with actionable details:

Task Title: ${title}
${currentDescription ? `Current Description: ${currentDescription}` : ''}

Provide:
1. An enhanced, detailed description (2-3 sentences)
2. Suggested action steps (3-5 steps)
3. Relevant tags (3-5 tags)

Respond in JSON format:
{
  "enhancedDescription": "<description>",
  "suggestedSteps": ["<step1>", "<step2>", ...],
  "tags": ["<tag1>", "<tag2>", ...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that enhances task descriptions with clear, actionable details.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        enhancedDescription: result.enhancedDescription || currentDescription || '',
        suggestedSteps: result.suggestedSteps || [],
        tags: result.tags || [],
      };
    } catch (error) {
      console.error('Error enhancing description:', error);
      throw new Error('Failed to enhance task description');
    }
  }

  async categorizeTask(
    title: string,
    description?: string
  ): Promise<TaskCategorization> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Analyze and categorize this task:

Task: ${title}
${description ? `Description: ${description}` : ''}

Determine:
1. Category (Development, Design, Testing, Documentation, Planning, Bug Fix, Feature, Research, Meeting, Other)
2. Priority (LOW, MEDIUM, HIGH, URGENT)
3. Relevant tags (3-5 tags)
4. Confidence level (0-100)

Respond in JSON format:
{
  "category": "<category>",
  "priority": "<priority>",
  "tags": ["<tag1>", "<tag2>", ...],
  "confidence": <0-100>
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management expert that categorizes and prioritizes tasks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        category: result.category || 'Other',
        priority: result.priority || 'MEDIUM',
        tags: result.tags || [],
        confidence: result.confidence || 50,
      };
    } catch (error) {
      console.error('Error categorizing task:', error);
      return {
        category: 'Other',
        priority: 'MEDIUM',
        tags: [],
        confidence: 0,
      };
    }
  }

  async generateTaskSuggestions(
    projectName: string,
    projectDescription?: string,
    existingTasks?: string[]
  ): Promise<TaskSuggestion[]> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Suggest 3 relevant tasks for this project:

Project: ${projectName}
${projectDescription ? `Description: ${projectDescription}` : ''}
${existingTasks?.length ? `Existing Tasks:\n${existingTasks.join('\n')}` : ''}

For each task, provide title, description, priority, and estimated duration.

Respond in JSON format:
{
  "tasks": [
    {
      "title": "<title>",
      "description": "<description>",
      "priority": "<LOW|MEDIUM|HIGH|URGENT>",
      "estimatedDuration": "<duration>"
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management expert that suggests relevant, actionable tasks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.tasks || [];
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return [];
    }
  }

  async analyzeTaskComplexity(
    title: string,
    description?: string
  ): Promise<{
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedHours: number;
    risks: string[];
    recommendations: string[];
  }> {
    if (!this.enabled) {
      throw new Error('AI features are not enabled. Please configure OPENAI_API_KEY.');
    }

    const prompt = `Analyze the complexity of this task:

Task: ${title}
${description ? `Description: ${description}` : ''}

Provide:
1. Complexity level (simple, moderate, complex)
2. Estimated hours to complete
3. Potential risks (2-3)
4. Recommendations (2-3)

Respond in JSON format:
{
  "complexity": "<simple|moderate|complex>",
  "estimatedHours": <number>,
  "risks": ["<risk1>", "<risk2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a technical project analyst that assesses task complexity.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        complexity: result.complexity || 'moderate',
        estimatedHours: result.estimatedHours || 4,
        risks: result.risks || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      return {
        complexity: 'moderate',
        estimatedHours: 4,
        risks: [],
        recommendations: [],
      };
    }
  }

  async summarizeProject(projectData: {
    name: string;
    description?: string;
    tasks: { title: string; status: string; priority?: string }[];
    activities?: string[];
  }): Promise<ProjectSummary> {
    if (!this.enabled) {
      throw new Error('AI service is not enabled');
    }

    try {
      const totalTasks = projectData.tasks.length;
      const completedTasks = projectData.tasks.filter(t => t.status === 'done').length;
      const activeTasks = projectData.tasks.filter(t => t.status === 'in_progress').length;

      const prompt = `Analyze this project and provide a comprehensive summary:
Project: ${projectData.name}
Description: ${projectData.description || 'No description'}
Total Tasks: ${totalTasks}
Completed: ${completedTasks}
Active: ${activeTasks}
Recent Tasks: ${projectData.tasks.slice(0, 10).map(t => `- ${t.title} (${t.status})`).join('\n')}

Provide a JSON response with:
- overview: 2-3 sentence project overview
- progress: Analysis of current progress status
- insights: Array of 3-5 key insights about the project
- recommendations: Array of 3-5 actionable recommendations`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project analyst that provides insightful project summaries.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        overview: result.overview || 'Project analysis not available',
        progress: result.progress || 'Progress analysis not available',
        keyMetrics: {
          totalTasks,
          completedTasks,
          activeTasks,
        },
        insights: result.insights || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error('Error summarizing project:', error);
      throw new Error('Failed to generate project summary');
    }
  }

  async convertMeetingNotesToTasks(meetingNotes: string): Promise<MeetingTask[]> {
    if (!this.enabled) {
      throw new Error('AI service is not enabled');
    }

    try {
      const prompt = `Extract actionable tasks from these meeting notes:

${meetingNotes}

Identify all action items, decisions, and tasks. For each task, provide:
- title: Clear, concise task title
- description: Detailed description including context from the meeting
- priority: low, medium, or high
- assignee: Person's name if mentioned (or null)
- dueDate: Date if mentioned (or null)

Return a JSON object with a "tasks" array.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting action items from meeting notes.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.tasks || [];
    } catch (error) {
      console.error('Error converting meeting notes:', error);
      throw new Error('Failed to convert meeting notes to tasks');
    }
  }

  async breakdownEpic(
    epicTitle: string,
    epicDescription: string,
    projectContext?: string,
  ): Promise<EpicBreakdown> {
    if (!this.enabled) {
      throw new Error('AI service is not enabled');
    }

    try {
      const prompt = `Break down this epic into detailed subtasks:

Epic: ${epicTitle}
Description: ${epicDescription}
${projectContext ? `Project Context: ${projectContext}` : ''}

Provide a JSON response with:
- subtasks: Array of subtasks, each with:
  - title: Clear subtask title
  - description: Detailed description
  - estimatedHours: Estimated time in hours
  - dependencies: Array of other subtask titles this depends on
- timeline: Suggested timeline/order of execution
- risks: Potential risks or challenges`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at breaking down complex tasks into manageable subtasks.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        subtasks: result.subtasks || [],
        timeline: result.timeline || 'No timeline provided',
        risks: result.risks || [],
      };
    } catch (error) {
      console.error('Error breaking down epic:', error);
      throw new Error('Failed to break down epic');
    }
  }

  async analyzeSentiment(text: string, context?: string): Promise<SentimentAnalysis> {
    if (!this.enabled) {
      throw new Error('AI service is not enabled');
    }

    try {
      const prompt = `Analyze the sentiment of this text:

Text: "${text}"
${context ? `Context: ${context}` : ''}

Provide a JSON response with:
- sentiment: 'positive', 'neutral', or 'negative'
- score: Number between -1 (very negative) and 1 (very positive)
- emotions: Array of detected emotions (e.g., "frustrated", "excited", "concerned")
- concerns: Array of any concerns or issues mentioned`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing sentiment and emotions in text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        sentiment: result.sentiment || 'neutral',
        score: result.score || 0,
        emotions: result.emotions || [],
        concerns: result.concerns || [],
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        sentiment: 'neutral',
        score: 0,
        emotions: [],
        concerns: [],
      };
    }
  }

  async detectRisks(projectData: {
    name: string;
    tasks: {
      title: string;
      status: string;
      priority?: string;
      dueDate?: string;
      assignee?: string;
    }[];
    activities?: string[];
    comments?: string[];
  }): Promise<RiskDetection> {
    if (!this.enabled) {
      throw new Error('AI service is not enabled');
    }

    try {
      const overdueTasks = projectData.tasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'done';
      });

      const highPriorityTasks = projectData.tasks.filter(t => t.priority === 'high');

      const prompt = `Analyze this project for risks, delays, and blockers:

Project: ${projectData.name}
Total Tasks: ${projectData.tasks.length}
Overdue Tasks: ${overdueTasks.length}
High Priority Tasks: ${highPriorityTasks.length}

Task Details:
${projectData.tasks.slice(0, 15).map(t => `- ${t.title} | Status: ${t.status} | Priority: ${t.priority || 'none'} | Due: ${t.dueDate || 'none'}`).join('\n')}

${projectData.comments ? `Recent Comments:\n${projectData.comments.slice(0, 5).join('\n')}` : ''}

Provide a JSON response with:
- risks: Array of detected risks, each with:
  - type: 'delay', 'blocker', 'resource', or 'technical'
  - severity: 'low', 'medium', or 'high'
  - description: What the risk is
  - mitigation: How to address it
- overallRiskScore: Number 0-100 indicating project risk level
- recommendations: Array of actionable recommendations`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying project risks and providing mitigation strategies.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        risks: result.risks || [],
        overallRiskScore: result.overallRiskScore || 0,
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error('Error detecting risks:', error);
      throw new Error('Failed to detect project risks');
    }
  }
}
