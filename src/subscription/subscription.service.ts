// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';
import Stripe from 'stripe';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly stripeService: StripeService,
  ) {}

  async createSubscription(
    userId: string,
    name: string,
    email: string,
    paymentMethodId: string,
    planId: string,
  ): Promise<any> {
    // Create a customer
    const oldSubscription = await this.subscriptionModel.findOne({ userId });

    const customer = !oldSubscription
      ? await this.stripeService.createCustomer(name, email, paymentMethodId)
      : { id: oldSubscription.stripeCustomerId };
    const stripeSubscription = await this.stripeService.createSubscription(
      customer.id,
      planId,
    );
    const newSubscription = {
      userId: userId,
      ...stripeSubscription,
    };
    const subscription = new this.subscriptionModel(newSubscription);
    subscription.save();
    return subscription;
  }

  async isSubscriptionValid(userId: string): Promise<boolean> {
    // Fetch subscription from MongoDB
    const subscription = await this.subscriptionModel.findOne({ userId });
    if (!subscription) return false;

    // Fetch latest status from Stripe
    try {
      const isValid =
        await this.stripeService.isSubscriptionValid(subscription);

      return isValid;
    } catch (error) {
      console.error('Stripe Subscription Check Failed:', error);
      return false;
    }
  }
}
