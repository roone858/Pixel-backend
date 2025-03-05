import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  stripeCustomerId: string;

  @Prop({ required: true })
  stripeSubscriptionId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ default: 'active' }) // active, canceled, trialing
  status: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
