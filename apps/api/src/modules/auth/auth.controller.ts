import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import type { SignupOrigin } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        name: { type: 'string', example: 'John Doe' },
      },
    },
  })
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
    @Body('origin') origin?: SignupOrigin,
  ) {
    return this.authService.register(email, password, name, origin);
  }

  @Post('google')
  @ApiOperation({ summary: 'Login/register via Google id_token' })
  async googleLogin(
    @Body('id_token') idToken?: string,
    @Body('access_token') accessToken?: string,
    @Body('origin') origin?: SignupOrigin,
  ) {
    if (!idToken && !accessToken) {
      throw new UnauthorizedException('Google token is required');
    }

    return this.authService.loginWithGoogleToken({
      idToken,
      accessToken,
      origin,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate current token' })
  async logout(@Request() req, @Body('refresh_token') refreshToken?: string) {
    const authHeader = req.headers.authorization as string | undefined;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (accessToken) {
      const decoded = await this.authService.validateToken(accessToken);
      if (decoded?.jti && decoded?.exp) {
        this.authService.revokeTokenByJti(decoded.jti, decoded.exp);
      }
    }

    if (refreshToken) {
      this.authService.revokeRefreshToken(refreshToken);
    }

    return { success: true };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset token' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using reset token' })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
