import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type ConfigType } from '@nestjs/config';
import type { AuthJwtPayload } from '../types/auth-jwtPayload';
import { AuthService } from '../auth.service';
import refreshConfig from '../config/refresh.config';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: refreshTokenConfig.secret!,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }
  // request.user
  validate(req: Request, payload: AuthJwtPayload) {
    const userId = payload.sub;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const refreshToken = req.body.refresh;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    if (typeof refreshToken !== 'string' || refreshToken.trim() === '') {
      throw new BadRequestException('Invalid refresh token format');
    }

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
