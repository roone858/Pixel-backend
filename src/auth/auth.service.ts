import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: MailService,
  ) {}

  async generateToken(id: string) {
    const payload = { _id: id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signIn(identifier: string, pass: string) {
    const user = await this.usersService.findByEmailOrUsername(identifier);

    if (!(await this.usersService.comparePasswords(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { _id: user._id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signup(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    const token = await this.jwtService.signAsync({ _id: newUser._id });
    this.emailService.sendVerificationEmail(createUserDto.email, token);
    return {
      access_token: token,
    };
  }

  async confirmEmail(token: string): Promise<any> {
    const decoded = await this.jwtService.decode(token);

    if (!decoded) {
      throw new NotFoundException('Invalid confirmation token');
    }
    const user = await this.usersService.findOneById(decoded._id);
    if (user) {
      this.usersService.confirmEmail(decoded._id);
      return 'confirmed';
    }
  }

  async validateGoogleToken(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
      googleId: payload?.sub,
      email: payload?.email,
      displayName: payload?.name,
      photo: payload?.picture,
    };
  }

  async createGoogleUser(profile: any): Promise<any> {
    const user = await this.usersService.findOneByEmail(
      profile.emails[0].value,
    );
    if (user) {
      return user;
    } else {
      const newUser = new this.userModel({
        email: profile.emails[0].value,
        profile: { name: profile.displayName, photo: profile.photos[0]?.value },
        googleId: profile.id,
      });
      return await newUser.save();
    }
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const existingUser = await this.userModel.findOne({ username });
    return !!existingUser;
  }

  async isEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.userModel.findOne({ email });
    return !!existingUser;
  }
}
