import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { type ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Profile as GoogleProfile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfig.clientID!,
      clientSecret: googleConfig.clientSecret!,
      callbackURL: googleConfig.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const email = profile?.emails?.[0]?.value;
    const displayName = profile?.displayName;

    if (!email || !displayName) {
      throw new UnauthorizedException(
        'Invalid profile data received from provider.',
      );
    }

    const user = await this.authService.validateGoogleUser({
      email,
      name: displayName,
      password: '',
    });

    done(null, user);
    // return user
    // request.user
  }
}
