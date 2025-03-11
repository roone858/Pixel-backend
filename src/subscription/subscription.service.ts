// payment.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';
import Stripe from 'stripe';
import { StripeService } from 'src/stripe/stripe.service';
import { PlansService } from 'src/plans/plans.service';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly stripeService: StripeService,
    private readonly plansService: PlansService,
  ) {}
  async findOneByUserID(userId: string) {
    const subscription = await this.subscriptionModel.findOne({
      userId,
      status: 'active',
    });
    return subscription;
  }
  async findAll() {
    const data = await this.subscriptionModel.aggregate([
      {
        $addFields: {
          userId: { $toObjectId: '$userId' },
          planId: { $toObjectId: '$planId' },
        }, // تحويل userId إلى ObjectId
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true, // يسمح بعرض الاشتراكات التي ليس لها مستخدم
        },
      },
      {
        $lookup: {
          from: 'plans', // اسم مجموعة الخطط في قاعدة البيانات
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      {
        $unwind: {
          path: '$plan',
          preserveNullAndEmptyArrays: true, // يسمح بعرض الاشتراكات التي ليس لها خطة
        },
      },
      {
        $project: {
          _id: 1,
          stripeCustomerId: 1,
          stripeSubscriptionId: 1,
          planId: 1,
          status: 1,
          createdAt: 1,
          user: { name: '$user.profile.name', email: '$user.email' },
          planName: '$plan.name', // استخراج اسم الخطة
        },
      },
    ]);

    return data;
  }

  async createSubscription(data: {
    userId: string;
    name: string;
    email: string;
    paymentMethodId: string;
    planId: string;
  }): Promise<any> {
    // Create a customer
    const oldSubscription = await this.subscriptionModel.findOne({
      userId: data.userId,
    });

    const customer = !oldSubscription
      ? await this.stripeService.createCustomer(
          data.name,
          data.email,
          data.paymentMethodId,
        )
      : { id: oldSubscription.stripeCustomerId };

    const plan = await this.plansService.findOne(data.planId);
    if (!plan) return new NotFoundException('this plan id not found');
    const stripeSubscription = await this.stripeService.createSubscription(
      customer.id,
      plan.priceId,
    );

    const newSubscription = {
      userId: data.userId,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
      stripeCustomerId: customer.id,
      planId: data.planId,
    };
    const subscription = new this.subscriptionModel(newSubscription);
    subscription.save();
    return subscription;
  }

  async isSubscriptionValid(userId: string): Promise<boolean> {
    // Fetch subscription from MongoDB
    const subscription = await this.subscriptionModel.findOne({
      userId,
      status: 'active',
    });
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
  async cancelAllSubscription() {
    const status = this.stripeService.cancelAllActiveSubscriptions();

    return status;
  }
  async cancelSubscription(stripeSubscriptionId: string, userId: string) {
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId: stripeSubscriptionId,
    });

    if (userId == subscription.userId) {
      await this.stripeService.cancelSubscription(stripeSubscriptionId);
      await this.subscriptionModel.updateOne(
        { stripeSubscriptionId },
        { $set: { status: 'canceled' } },
      );

      return { success: true, message: 'Subscription Canceled successfully' };
    } else return new UnauthorizedException();
  }
}
