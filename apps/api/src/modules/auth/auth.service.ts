import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { SignupOrigin } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private workspacesService: WorkspacesService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Get user's workspaces
    const workspaces = await this.workspacesService.findAll(user.id);
    const defaultWorkspace = workspaces[0]; // Use first workspace as default

    const payload = { 
      email: user.email, 
      sub: user.id,
      workspaceId: defaultWorkspace?.id,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      workspace: defaultWorkspace || null,
    };
  }

  async register(email: string, password: string, name: string, origin?: SignupOrigin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });
    
    // Create default workspace for new user
    const workspace = await this.workspacesService.create(
      `${name}'s Workspace`,
      user.id
    );

    const signupOrigin: SignupOrigin = {
      source: origin?.source || 'email_form',
      utmSource: origin?.utmSource,
      campaign: origin?.campaign,
      inviteToken: origin?.inviteToken,
    };

    await this.usersService.recordSignupEvent({
      userId: user.id,
      email: user.email,
      name: user.name,
      method: 'email',
      workspaceId: workspace.id,
      origin: signupOrigin,
    });
    
    const { password: _, ...result } = user;
    return this.login(result);
  }

  async loginWithGoogleToken(params: { idToken?: string; accessToken?: string; origin?: SignupOrigin }) {
    const profile = params.idToken
      ? await this.verifyGoogleIdToken(params.idToken)
      : await this.verifyGoogleAccessToken(params.accessToken || '');

    const generatedPasswordHash = await bcrypt.hash(randomUUID(), 10);

    const { user, isNew } = await this.usersService.upsertOAuthUser({
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.picture,
      generatedPasswordHash,
    });

    const workspaces = await this.workspacesService.findAll(user.id);
    let defaultWorkspaceId = workspaces[0]?.id;

    if (workspaces.length === 0) {
      const workspace = await this.workspacesService.create(`${user.name}'s Workspace`, user.id);
      defaultWorkspaceId = workspace.id;
    }

    if (isNew) {
      const signupOrigin: SignupOrigin = {
        source: params.origin?.source || 'google_oauth',
        utmSource: params.origin?.utmSource,
        campaign: params.origin?.campaign,
        inviteToken: params.origin?.inviteToken,
      };

      await this.usersService.recordSignupEvent({
        userId: user.id,
        email: user.email,
        name: user.name,
        method: 'google',
        workspaceId: defaultWorkspaceId || null,
        origin: signupOrigin,
      });
    }

    return this.login({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
  }

  private async verifyGoogleIdToken(idToken: string): Promise<{
    email: string;
    name?: string;
    picture?: string;
  }> {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = (await response.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
      picture?: string;
    };

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID;
    if (clientId && payload.aud !== clientId) {
      throw new UnauthorizedException('Google token audience mismatch');
    }

    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!payload.email || !emailVerified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  private async verifyGoogleAccessToken(accessToken: string): Promise<{
    email: string;
    name?: string;
    picture?: string;
  }> {
    if (!accessToken) {
      throw new UnauthorizedException('Google access_token is required');
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    const payload = (await response.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    if (!payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
