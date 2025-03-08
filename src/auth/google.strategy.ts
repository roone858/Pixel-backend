// google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { createSlug } from 'src/Util/createSlug';
import { CreateUserDto, UserRole } from 'src/users/dto/create-user.dto';
interface ProfileInterface {
  id: string;
  emails: { value: string }[];
  photos: { value: string }[];
  displayName: string;
  profile: { name: string; photo: string };
  username: string;
  emailConfirmed: true;
}
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
    profile: ProfileInterface,
    done: VerifyCallback,
  ) {
    try {
      const baseUsername = createSlug(
        `${profile.displayName} ${profile.id} `,
      ).toLowerCase();

      const newUser: CreateUserDto = {
        googleId: profile.id,
        email: profile.emails[0].value,
        profile: {
          name: profile.displayName,
          photo: profile.photos[0].value,
        },
        username: baseUsername,
        emailConfirmed: true,
        role: UserRole.User,
      };

      const user = await this.authService.findOrCreateGoogleUser(newUser);

      done(null, user);
    } catch (error) {
      console.log(error);
      done(error, null);
    }
  }
}
