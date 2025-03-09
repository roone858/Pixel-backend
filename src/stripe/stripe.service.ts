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
  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
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

  async createSubscription(customerId: string, priceId: string) {
    try {
      // Create a subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
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
  async cancelAllActiveSubscriptions() {
    const subscriptions = await this.stripe.subscriptions.list({
      status: 'active',
    });

    for (const sub of subscriptions.data) {
      await this.stripe.subscriptions.update(sub.id);
      //  (sub.id, { cancel_at_period_end: true, });
      console.log(`Deleted subscription: ${sub.id}`);
    }
  }
  async cancelSubscription(stripSubscriptionId: string) {
    try {
      const deletedSubscription =
        await this.stripe.subscriptions.cancel(stripSubscriptionId);
      return deletedSubscription.status;
    } catch (error) {
      return null;
    }
  }
  async refundPayment(paymentIntentId: string) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      console.log(`Refund successful: ${refund.id}`);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      return null;
    }
  }
}
