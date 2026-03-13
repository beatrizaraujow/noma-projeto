import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
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
}
