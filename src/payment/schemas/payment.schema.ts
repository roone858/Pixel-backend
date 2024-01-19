// payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export type PaymentDocument = Payment & Document;
@Schema()
export class TransactionDetails {
  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;
}

export const TransactionDetailsSchema =
  SchemaFactory.createForClass(TransactionDetails);

@Schema()
export class SubscriptionDetails {
  @Prop({ type: String, enum: Object.values(SubscriptionPlan), required: true })
  plan: SubscriptionPlan;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;
}

export const SubscriptionDetailsSchema =
  SchemaFactory.createForClass(SubscriptionDetails);
@Schema()
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: TransactionDetailsSchema, required: true })
  transactionDetails: TransactionDetails;

  @Prop({ type: SubscriptionDetailsSchema })
  subscriptionDetails: SubscriptionDetails;
  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
