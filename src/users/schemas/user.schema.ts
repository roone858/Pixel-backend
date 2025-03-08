import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class UserProfile {
  @Prop({ required: true })
  name: string;

  @Prop()
  photo: string;
}

@Schema()
export class UserPreferences {
  // Define user preferences properties
}

@Schema()
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: UserProfile })
  profile: UserProfile;

  @Prop({ type: UserPreferences })
  preferences: UserPreferences;

  @Prop({ type: [String], default: [] })
  authenticationTokens: string[];

  @Prop({ required: false, default: false })
  emailConfirmed: boolean;

  @Prop({ required: false, default: 'user', enum: ['user', 'admin'] })
  role: 'user' | 'admin';
  @Prop()
  googleId: string;

  @Prop()
  facebookId: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
