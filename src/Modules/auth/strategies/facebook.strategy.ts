import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: process.env.FACEBOOK_CALL_BACK!,
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'picture'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const { emails, name } = profile;

    const user = {
      email: emails?.[0]?.value,
      first_name: name?.givenName,
      last_name: name?.familyName,
    };

    done(null, user);
  }
}
