import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /** 🔥 Generate JWT Token */
  async generateToken(userId: string): Promise<{ access_token: string }> {
    const payload = { _id: userId };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  /** 🔑 User Sign-In */
  async signIn(
    identifier: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.usersService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user._id);
  }

  /** 📝 User Sign-Up */
  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    console.log(createUserDto);
    createUserDto.profile.photo =
      'http://localhost:3000/users/profile-picture/default-profile-picture.webp';
    const newUser = await this.usersService.create(createUserDto);
    const token = await this.generateToken(newUser._id);

    // Send verification email
    await this.mailService.sendVerificationEmail(
      createUserDto.email,
      token.access_token,
    );

    return token;
  }

  /** 📩 Confirm Email */
  async confirmEmail(token: string): Promise<string> {
    const decoded = (await this.jwtService.decode(token)) as {
      _id: string;
    } | null;
    if (!decoded || !decoded._id) {
      throw new NotFoundException('Invalid confirmation token');
    }
    await this.usersService.confirmEmail(decoded._id);
    return 'Email confirmed successfully';
  }

  /** 🔍 Find or Create Google User */
  async findOrCreateGoogleUser(user: CreateUserDto): Promise<UserDocument> {
    return (
      (await this.usersService.findByEmail(user.email)) ??
      this.usersService.createUser(user)
    );
  }

  /** 🔍 Find or Create Facebook User */
  async findOrCreateFacebookUser(user: CreateUserDto): Promise<UserDocument> {
    return (
      (await this.usersService.findByFacebookId(user.facebookId)) ??
      this.usersService.createUser(user)
    );
  }

  /** 🔄 Check if Username is Taken */
  async isUsernameTaken(username: string): Promise<boolean> {
    return !!(await this.usersService.findByIdentifier(username));
  }

  /** 🔄 Check if Email Exists */
  async isEmailExists(email: string): Promise<boolean> {
    return !!(await this.usersService.findByEmail(email));
  }
}
