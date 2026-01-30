import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('invites')
@ApiBearerAuth()
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create workspace invite' })
  async create(
    @Body() body: { workspaceId: string; email: string; role: string },
    @Request() req,
  ) {
    return this.invitesService.create(
      body.workspaceId,
      body.email,
      body.role,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('workspace/:workspaceId')
  @ApiOperation({ summary: 'Get all pending invites for workspace' })
  async findByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.invitesService.findByWorkspace(workspaceId);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify invite token' })
  async verify(@Query('token') token: string) {
    return this.invitesService.findByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept')
  @ApiOperation({ summary: 'Accept workspace invite' })
  async accept(@Body() body: { token: string }, @Request() req) {
    return this.invitesService.accept(body.token, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Revoke invite' })
  async revoke(
    @Param('id') id: string,
    @Body() body: { workspaceId: string },
  ) {
    return this.invitesService.revoke(id, body.workspaceId);
  }
}
