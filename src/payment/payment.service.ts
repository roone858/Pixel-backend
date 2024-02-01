// payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  SubscriptionPlan,
} from './schemas/payment.schema';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    this.stripe = new Stripe(
      'sk_test_51OM8bHDLQcvajEnucHWx2eB0vlLJhksfadJAf44q23DUYnRuMwK42mK0HXcAwvYxCR6FiDmbCfCKZZRLJKH4BPys00H6r1sCuM',
    );
  }

  async createPayment(payment: Payment): Promise<Payment> {
    const createdPayment = new this.paymentModel(payment);
    return createdPayment.save();
  }

  async createPaymentIntent(
    amount: number,
    data: any,
    userId,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        confirm: true,
        payment_method_data: data,
        return_url: 'http://localhost:5173/',
      });

      console.log('Created PaymentIntent:', paymentIntent.id);

      const currentDate = new Date();

      const startDate = new Date(currentDate);

      const endDate = new Date(currentDate);

      endDate.setMonth(endDate.getMonth() + 3);

      const newPayment = {
        userId,
        transactionDetails: {
          amount: amount,
          description: 'Premium subscription payment',
        },
        subscriptionDetails: {
          plan: SubscriptionPlan.PREMIUM,
          startDate: startDate,
          endDate: endDate,
        },
        timestamp: new Date(),
      };
      this.createPayment(newPayment);

      return paymentIntent;
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async findAllPayments(): Promise<Payment[]> {
    return this.paymentModel.find().exec();
  }

  async findPaymentById(id: string): Promise<Payment> {
    return this.paymentModel.findById(id).exec();
  }
  async findPaymentByUserId(userId: string): Promise<Payment> {
    return this.paymentModel.findOne({ userId }).exec();
  }
  async isPaymentNotExpired(userId: string): Promise<boolean> {
    const userPayment = await this.findPaymentByUserId(userId);
    if (userPayment && userPayment.subscriptionDetails.endDate) {
      return new Date() <= new Date(userPayment.subscriptionDetails.endDate);
    }
    return false;
  }
}
