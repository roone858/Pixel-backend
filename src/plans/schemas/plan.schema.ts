import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Plan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  priceId: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  period: number;

  @Prop()
  description: string;

  @Prop({ type: [String] })
  features: string[];

  @Prop({ default: false })
  isPopular: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
