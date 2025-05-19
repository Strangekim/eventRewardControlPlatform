import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type RewardRequestDocument = RewardRequest & Document;

@Schema({ timestamps: true })
export class RewardRequest {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  eventId: Types.ObjectId;

  @Prop()
  status: 'success' | 'fail';

  @Prop()
  reason?: string; // 실패 사유

  @Prop()
  processedAt: Date;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);
