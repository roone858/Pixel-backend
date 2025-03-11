import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    request.headers.authorization = `Bearer ${token}`; // Inject token into headers
    return super.canActivate(context); // Call the default behavior
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('Custom JWT Guard: Access Denied');
    }
    return user;
  }

  private extractToken(request: Request): string | null {
    // 1️⃣ تحقق من الهيدر Authorization
    if (request.headers.authorization?.startsWith('Bearer ')) {
      return request.headers.authorization.split(' ')[1];
    }

    // 2️⃣ تحقق من Query Params (مثال: /route?token=your_token)
    if (request.query?.token) {
      return request.query.token as string;
    }

    // 3️⃣ تحقق من Body (مثال: { "token": "your_token" })
    if (request.body?.token) {
      return request.body.token;
    }

    return null; // لم يتم العثور على التوكن
  }
}
