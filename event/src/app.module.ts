import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './app.controller';
import { EventService } from './app.service';
import { Event, EventSchema } from './schemas/event.schemas';
import { Reward, RewardSchema } from './schemas/reward.schemas';
import { User, UserSchema } from './schemas/user.schemas';
import {RewardRequest,RewardRequestSchema} from './schemas/reward_request.schema'

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),

    // 이벤트 DB 연결
    MongooseModule.forRoot(process.env.MONGO_EVENT_URI!), // 기본 연결

    // 이벤트 관련 모델들
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class AppModule {}
