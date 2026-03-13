import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TokenRevocationService } from './token-revocation.service';
import type { SignupOrigin } from '../users/users.service';

type AuthTokenBundle = {
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
};

@Injectable()
export class AuthService {
  private readonly passwordResetTokens = new Map<string, { userId: string; expiresAtMs: number }>();

  constructor(
    private usersService: UsersService,
    private workspacesService: WorkspacesService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenRevocationService: TokenRevocationService,
  ) {}

  private getAccessTokenTtl(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
  }

  private getRefreshTokenTtl(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET', '');
  }

  private decodeExp(token: string): number {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) {
      throw new UnauthorizedException('Token expiration is invalid');
    }
    return decoded.exp;
  }

  private issueTokens(payload: { email: string; sub: string; workspaceId?: string }): AuthTokenBundle {
    const access_token = this.jwtService.sign(
      {
        ...payload,
        tokenType: 'access',
      },
      {
        expiresIn: this.getAccessTokenTtl(),
        jwtid: randomUUID(),
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        ...payload,
        tokenType: 'refresh',
      },
      {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshTokenTtl(),
        jwtid: randomUUID(),
      },
    );

    const accessExp = this.decodeExp(access_token);
    const refreshExp = this.decodeExp(refresh_token);
    const nowSeconds = Math.floor(Date.now() / 1000);

    return {
      access_token,
      refresh_token,
      access_token_expires_in: Math.max(accessExp - nowSeconds, 0),
      refresh_token_expires_in: Math.max(refreshExp - nowSeconds, 0),
    };
  }

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

    const tokens = this.issueTokens(payload);
    
    return {
      ...tokens,
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
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    this.assertPasswordPolicy(password);

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

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token) as { jti?: string; tokenType?: string; exp?: number };

      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid access token');
      }

      if (this.tokenRevocationService.isRevoked(decoded.jti)) {
        throw new UnauthorizedException('Token revoked');
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshToken: string) {
    let decoded: {
      email: string;
      sub: string;
      workspaceId?: string;
      tokenType?: string;
      jti?: string;
      exp?: number;
    };

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (decoded.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    if (this.tokenRevocationService.isRevoked(decoded.jti)) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (decoded.jti && decoded.exp) {
      this.tokenRevocationService.revoke(decoded.jti, decoded.exp);
    }

    return this.issueTokens({
      email: decoded.email,
      sub: decoded.sub,
      workspaceId: decoded.workspaceId,
    });
  }

  revokeRefreshToken(refreshToken: string): void {
    let decoded: { jti?: string; exp?: number; tokenType?: string };

    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      return;
    }

    if (decoded.tokenType === 'refresh' && decoded.jti && decoded.exp) {
      this.tokenRevocationService.revoke(decoded.jti, decoded.exp);
    }
  }

  revokeTokenByJti(jti: string, exp: number): void {
    this.tokenRevocationService.revoke(jti, exp);
  }

  private assertPasswordPolicy(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      throw new BadRequestException('Password must include upper, lower, and numeric characters');
    }
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

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || this.configService.get<string>('AUTH_GOOGLE_ID');
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

  async requestPasswordReset(email: string): Promise<{ success: boolean; resetToken?: string }> {
    if (!email) {
      return { success: true };
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { success: true };
    }

    const resetToken = randomBytes(24).toString('hex');
    const expiresAtMs = Date.now() + 60 * 60 * 1000;

    this.passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAtMs,
    });

    if (process.env.NODE_ENV !== 'production') {
      return {
        success: true,
        resetToken,
      };
    }

    return { success: true };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean }> {
    const entry = this.passwordResetTokens.get(resetToken);
    if (!entry) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (entry.expiresAtMs < Date.now()) {
      this.passwordResetTokens.delete(resetToken);
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    this.assertPasswordPolicy(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(entry.userId, hashedPassword);
    this.passwordResetTokens.delete(resetToken);

    return { success: true };
  }
}
