import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop()
  role: string;

  @Prop({
    type: [
      {
        eventId: { type: Types.ObjectId, ref: 'Event' },
        type: { type: String },
        current: { type: Object },
        lastUpdated: { type: Date },
      },
    ],
    default: [],
  })
  eventProgress: {
    eventId: Types.ObjectId;
    type: string;
    current: Record<string, any>;
    lastUpdated: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
