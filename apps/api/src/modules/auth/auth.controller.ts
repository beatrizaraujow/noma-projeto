import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle, SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { SignupOrigin } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // O login chega SEMPRE pelo IP de saida (compartilhado) da Vercel, porque o
  // authorize() do NextAuth roda server-side. Rate limit por IP aqui estrangula
  // TODOS os usuarios juntos (o IP e o mesmo para todos). Por isso pulamos o
  // throttler por IP ('default') e mantemos apenas o por conta/email ('account'),
  // que e a protecao correta contra brute-force de uma conta especifica.
  @SkipThrottle({ default: true })
  @Throttle({ account: { limit: 10, ttl: 900000 } })
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
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

  // Mesmo motivo do login: o cadastro tambem chega pelo IP compartilhado da
  // Vercel. Chaveamos por conta/email ('account'), nao por IP.
  @SkipThrottle({ default: true })
  @Throttle({ account: { limit: 10, ttl: 900000 } })
  @UseGuards(ThrottlerGuard)
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        name: { type: 'string', example: 'Nome Sobrenome' },
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

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
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

    return this.authService.loginWithGoogleToken({ idToken, accessToken, origin });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({ summary: 'Renew JWT token' })
  async refresh(@Request() req) {
    return this.authService.refresh({
      sub: req.user.userId,
      email: req.user.email,
      workspaceId: req.user.workspaceId,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Logout (client must discard the token)' })
  logout() {
    return { message: 'Logged out successfully' };
  }
}
