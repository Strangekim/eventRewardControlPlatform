import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


class EventProgressEntry {
  @Prop({ type: String, required: true })
  eventId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, required: true })
  current: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;

  @Prop({ type: Boolean, default: false })
  rewardReceived: boolean;
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    enum: ['guest', 'user', 'operator', 'auditor', 'admin'],
    default: 'guest',
  })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;

  @Prop({ type: [EventProgressEntry], default: [] })
  eventProgress: EventProgressEntry[];
}

export const UserSchema = SchemaFactory.createForClass(User);
