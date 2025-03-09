import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users.service';
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.usersService.findById(request.user._id);

    if (!user) {
      throw new UnauthorizedException();
    }
    try {
      return user.role === 'admin';
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(request: Request): string | undefined {
    // Extract from Authorization header
    if (request.headers.authorization) {
      const [type, token] = request.headers.authorization.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    // Extract from Query Params (e.g., /api/route?token=xyz)
    if (request.query.token) {
      return request.query.token as string;
    }

    // Extract from Request Body (if applicable)
    if (request.body.token) {
      return request.body.token as string;
    }

    return undefined;
  }
}
