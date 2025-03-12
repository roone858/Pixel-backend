import { Strategy } from 'passport-facebook';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { createSlug } from 'src/common/Util/createSlug';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: '1566867584716024',
      clientSecret: 'fed110c0eb48aca3c0291c627b3299dd',
      callbackURL: 'http://localhost:3000/auth/facebook/redirect',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    try {
      const baseUsername = createSlug(
        `${profile.name.givenName} ${profile.name.familyName} ${profile.id} `,
      ).toLowerCase();
      const userData = {
        facebookId: profile.id,
        email: profile.id + '@facebook.invalid',
        profile: {
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          photo: profile.photos[0]?.value || '',
        },
        username: baseUsername,
        emailConfirmed: false,
      };
      const user = await this.authService.findOrCreateFacebookUser(userData);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
// {
//   id: '4139240416303864',
//   username: undefined,
//   displayName: undefined,
//   name: { familyName: 'Gamal', givenName: 'Mahmoud', middleName: undefined },
//   gender: undefined,
//   profileUrl: undefined,
//   photos: [
//     {
//       value: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4139240416303864&height=200&width=200&ext=1744021382&hash=AbYG8mFd4p_DpJSfTigE19Zb'
//     }
//   ],
//   provider: 'facebook',
//   _raw: '{"id":"4139240416303864","last_name":"Gamal","first_name":"Mahmoud","picture":{"data":{"height":200,"is_silhouette":false,"url":"https:\\/\\/platform-lookaside.fbsbx.com\\/platform\\/profilepic\\/?asid=4139240416303864&height=200&width=200&ext=1744021382&hash=AbYG8mFd4p_DpJSfTigE19Zb","width":200}}}',
//   _json: {
//     id: '4139240416303864',
//     last_name: 'Gamal',
//     first_name: 'Mahmoud',
//     picture: { data: [Object] }
//   }
// }
