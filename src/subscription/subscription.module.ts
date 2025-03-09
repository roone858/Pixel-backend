// payment.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { StripeService } from 'src/stripe/stripe.service';
import { UsersModule } from 'src/users/users.module';
import { PlansService } from 'src/plans/plans.service';
import { PlansModule } from 'src/plans/plans.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    StripeModule,
    PlansModule,
  ],
  providers: [SubscriptionService, StripeService, PlansService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
