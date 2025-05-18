import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PingController, EventController } from './app.controller';
import { EventService } from './app.service';
import { Event, EventSchema } from './schemas/event.schemas';
import { Reward, RewardSchema } from './schemas/reward.schemas';
import { User, UserSchema } from './schemas/user.schemas';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // 1️⃣ 이벤트 DB 연결
    MongooseModule.forRoot(process.env.MONGO_EVENT_URI!), // event DB
    MongooseModule.forRoot(process.env.MONGO_AUTH_URI!, {
      connectionName: 'authConnection', // ← 이거 누락됐음
    }),

    // 2️⃣ 유저(auth) DB 연결 추가 (이름 지정 필수)
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'authConnection', // 별명
    ),

    // 3️⃣ 이벤트 DB의 모델들 (기본 커넥션)
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],
  controllers: [PingController, EventController],
  providers: [EventService],
})
export class AppModule {}
