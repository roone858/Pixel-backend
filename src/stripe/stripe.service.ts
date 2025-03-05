import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionDocument } from 'src/subscription/schemas/subscription.schema';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  async createCustomer(name: string, email: string, paymentMethodId: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name: name,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      return customer;
    } catch (error) {
      console.error('Customer Error:', error);
      throw error;
    }
  }

  async createSubscription(customerId: string, planId: string) {
    try {
      // Create a subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        stripeCustomerId: customerId,
        planId: planId,
      };
    } catch (error) {
      console.error('Subscription Error:', error);
      throw error;
    }
  }
  async isSubscriptionValid(
    subscription: SubscriptionDocument,
  ): Promise<boolean> {
    try {
      const stripeSub = await this.stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
      );
      return stripeSub.status === 'active' || stripeSub.status === 'trialing';
    } catch (error) {
      console.error('Stripe Subscription Check Failed:', error);
      return false;
    }
  }
  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }
}
