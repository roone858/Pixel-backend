// jwt.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();
export const JwtPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const token =
      extractJwtFromHeader(request.headers.authorization) ||
      request.query.token;
    if (token) {
      try {
        const jwtService = new JwtService({ secret: process.env.JWT_SECRET }); // You can inject JwtService if it's registered in your module
        const decoded = jwtService.verify(token);

        return decoded;
      } catch (error) {
        return undefined; // Invalid token
      }
    }

    return undefined; // No token provided in the header
  },
);

function extractJwtFromHeader(authorizationHeader: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
