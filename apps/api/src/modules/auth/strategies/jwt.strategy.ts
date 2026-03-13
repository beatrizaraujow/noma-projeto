import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenRevocationService } from '../token-revocation.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private tokenRevocationService: TokenRevocationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload?.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type for API access');
    }

    if (payload?.jti && this.tokenRevocationService.isRevoked(payload.jti)) {
      throw new UnauthorizedException('Token revoked');
    }

    return { 
      userId: payload.sub, 
      email: payload.email,
      workspaceId: payload.workspaceId,
    };
  }
}
