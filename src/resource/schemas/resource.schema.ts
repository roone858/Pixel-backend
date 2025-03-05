import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
export type ResourceDocument = Resource & Document;
@Schema()
export class Metadata {
  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  resolution: string;

  @Prop({ required: true })
  format: string;

  // Add other metadata properties as needed
}

@Schema()
export class DownloadStatistics {
  @Prop({ default: 0 })
  downloadCount: number;

  @Prop({ default: 0 })
  likes: number;

  // Add other statistics properties as needed
}

@Schema()
export class Resource extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String,
    ref: 'Category',
  })
  category: string;

  @Prop({ type: String })
  fileName: string;

  @Prop({ type: Metadata })
  metadata: Metadata;

  @Prop({ type: String, ref: 'User', required: true })
  uploader: string;

  @Prop({ type: DownloadStatistics, default: {} })
  downloadStatistics: DownloadStatistics;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
