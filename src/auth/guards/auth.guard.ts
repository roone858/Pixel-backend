import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    console.log(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
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
