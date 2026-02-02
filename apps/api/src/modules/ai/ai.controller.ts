import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private aiService: AIService) {}

  @Get('status')
  getStatus() {
    return {
      enabled: this.aiService.isEnabled(),
      message: this.aiService.isEnabled()
        ? 'AI features are enabled'
        : 'AI features are disabled. Configure OPENAI_API_KEY to enable.',
    };
  }

  @Post('suggest-title')
  async suggestTitle(
    @Body() body: { context: string; projectName?: string }
  ) {
    const suggestions = await this.aiService.suggestTaskTitle(
      body.context,
      body.projectName
    );
    return { suggestions };
  }

  @Post('predict-due-date')
  async predictDueDate(
    @Body()
    body: {
      taskTitle: string;
      taskDescription?: string;
      projectContext?: string;
    }
  ) {
    const prediction = await this.aiService.predictDueDate(
      body.taskTitle,
      body.taskDescription,
      body.projectContext
    );
    return prediction;
  }

  @Post('enhance-description')
  async enhanceDescription(
    @Body() body: { title: string; currentDescription?: string }
  ) {
    const enhancement = await this.aiService.enhanceTaskDescription(
      body.title,
      body.currentDescription
    );
    return enhancement;
  }

  @Post('categorize-task')
  async categorizeTask(
    @Body() body: { title: string; description?: string }
  ) {
    const categorization = await this.aiService.categorizeTask(
      body.title,
      body.description
    );
    return categorization;
  }

  @Post('generate-tasks')
  async generateTasks(
    @Body()
    body: {
      projectName: string;
      projectDescription?: string;
      existingTasks?: string[];
    }
  ) {
    const suggestions = await this.aiService.generateTaskSuggestions(
      body.projectName,
      body.projectDescription,
      body.existingTasks
    );
    return { suggestions };
  }

  @Post('analyze-complexity')
  async analyzeComplexity(
    @Body() body: { title: string; description?: string }
  ) {
    const analysis = await this.aiService.analyzeTaskComplexity(
      body.title,
      body.description
    );
    return analysis;
  }

  @Post('summarize-project')
  async summarizeProject(
    @Body()
    body: {
      name: string;
      description?: string;
      tasks: { title: string; status: string; priority?: string }[];
      activities?: string[];
    }
  ) {
    const summary = await this.aiService.summarizeProject(body);
    return summary;
  }

  @Post('meeting-to-tasks')
  async convertMeetingNotes(
    @Body() body: { meetingNotes: string }
  ) {
    const tasks = await this.aiService.convertMeetingNotesToTasks(
      body.meetingNotes
    );
    return { tasks };
  }

  @Post('breakdown-epic')
  async breakdownEpic(
    @Body()
    body: {
      epicTitle: string;
      epicDescription: string;
      projectContext?: string;
    }
  ) {
    const breakdown = await this.aiService.breakdownEpic(
      body.epicTitle,
      body.epicDescription,
      body.projectContext
    );
    return breakdown;
  }

  @Post('analyze-sentiment')
  async analyzeSentiment(
    @Body() body: { text: string; context?: string }
  ) {
    const analysis = await this.aiService.analyzeSentiment(
      body.text,
      body.context
    );
    return analysis;
  }

  @Post('detect-risks')
  async detectRisks(
    @Body()
    body: {
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
    }
  ) {
    const risks = await this.aiService.detectRisks(body);
    return risks;
  }
}
