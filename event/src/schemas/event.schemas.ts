import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 자동 관리
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  description: string;

  @Prop({ type: Object })
  conditions: Record<string, any>; // 동적 조건

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  startAt: Date;

  @Prop()
  endAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
