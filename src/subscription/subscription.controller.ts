// payment.controller.ts
import {
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create-subscription')
  async createSubscription(
    @Request() req,
    @Body()
    data: {
      name: string;
      email: string;
      paymentMethodId: string;
      planId: string;
    },
  ) {
    console.log(data);
    return this.subscriptionService.createSubscription(
      req.user._id,
      data.name,
      data.email,
      data.paymentMethodId,
      data.planId,
    );
  }

  @Post('check-subscription')
  async checkSubscription(@Request() req) {
    const isValid = this.subscriptionService.isSubscriptionValid(req.user._id);
    if (!isValid) {
      throw new HttpException(
        'Subscription expired or invalid',
        HttpStatus.FORBIDDEN,
      );
    }

    return { message: 'Subscription is valid', status: HttpStatus.OK };
  }
}
