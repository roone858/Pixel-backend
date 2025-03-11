import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { JwtService } from '@nestjs/jwt';

interface ExtendedRequest extends Request {
  user?: { _id: string }; // إضافة user للطلب
  isSubscriptionValid?: boolean; // حالة الاشتراك
  isSubscriptionChecked?: boolean; // تم التحقق أم لا
}

@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return next();
      }

      const decoded = this.jwtService.decode(token) as { _id: string };
      if (!decoded || !decoded._id) {
        throw new UnauthorizedException('Invalid token');
      }

      req.user = { _id: decoded._id };

      if (!req.isSubscriptionChecked) {
        req.isSubscriptionValid =
          await this.subscriptionService.isSubscriptionValid(decoded._id);
        req.isSubscriptionChecked = true;
      }

      next();
    } catch (error) {
      next(); // Continue request even if subscription check fails (to be handled by guards)
    }
  }

  private extractToken(request: Request): string | undefined {
    if (request.headers.authorization) {
      const [type, token] = request.headers.authorization.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    if (request.query.token) {
      return request.query.token as string;
    }

    if (request.body.token) {
      return request.body.token as string;
    }

    return undefined;
  }
}
