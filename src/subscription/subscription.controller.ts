// payment.controller.ts
import {
  Body,
  Controller,
  Request,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/users/guards/admin.guard';

@Controller('subscription')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('all')
  @UseGuards(AdminGuard)
  async findAll() {
    return this.subscriptionService.findAll();
  }

  @Get()
  async findOne(@Request() req) {
    return this.subscriptionService.findOneByUserID(req.user._id);
  }
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
    return this.subscriptionService.createSubscription({
      userId: req.user._id,
      ...data,
    });
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

  @Delete()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async cancelAllSubscription() {
    return this.subscriptionService.cancelAllSubscription();
  }

  @Delete(':stripeSubscriptionId')
  async cancelSubscription(
    @Request() req: any,
    @Param('stripeSubscriptionId') stripeSubscriptionId: string,
  ) {
    return this.subscriptionService.cancelSubscription(
      stripeSubscriptionId,
      req.user._id,
    );
  }
}
