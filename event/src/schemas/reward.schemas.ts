import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // createdAt만 사용
export class Reward {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ required: true, enum: ['point', 'item', 'coupon'] })
  rewardType: string;

  @Prop()
  amount?: number;

  @Prop()
  itemCode?: string;

  @Prop()
  couponCode?: string;

  @Prop()
  description: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
