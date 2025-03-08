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
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: MailService,
  ) {}

  async generateToken(id: string) {
    // if (!id) throw new UnauthorizedException();
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

  async findOrCreateGoogleUser(user: CreateUserDto): Promise<UserDocument> {
    const foundUser = await this.usersService.findOneByEmail(user.email);
    if (foundUser) {
      return foundUser;
    } else {
      const newUser = await this.usersService.createUser(user);
      return newUser;
    }
  }
  async findOrCreateFacebookUser(user: CreateUserDto): Promise<UserDocument> {
    const existsUser = await this.usersService.findByFacebookId(
      user.facebookId,
    );
    if (existsUser) {
      return existsUser;
    } else {
      const newUser = await this.usersService.createUser(user);
      return newUser;
    }
  }
  async isUsernameTaken(username: string): Promise<boolean> {
    const existingUser =
      await this.usersService.findByEmailOrUsername(username);
    return !!existingUser;
  }

  async isEmailExists(email: string): Promise<boolean> {
    const existingUser = await this.usersService.findOneByEmail(email);
    return !!existingUser;
  }
}
