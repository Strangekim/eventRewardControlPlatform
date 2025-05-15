import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // bcrypt 해시 저장용

  @Prop({
    required: true,
    enum: ['guest', 'user', 'operator', 'auditor', 'admin'],
    default: 'guest',
  })
  role: string;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
