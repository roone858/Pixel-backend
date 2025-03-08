// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '267563929540-8daabl4s320r13sb9813tlgvmkdpegqv.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.createGoogleUser(profile);
    // const user = {
    //   googleId: profile.id,
    //   email: profile.emails[0].value,
    //   name: profile.displayName,
    //   photo: profile.photos[0]?.value,
    // };
    done(null, user);
  }
}
