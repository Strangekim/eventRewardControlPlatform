import { Module } from '@nestjs/common';
import { PingController,EventController } from './app.controller';
import { EventService } from './app.service';
import { Event, EventSchema } from './schemas/event.schemas';
import { Reward, RewardSchema } from './schemas/reward.schemas';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),

    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
    ])
  ],
  controllers: [PingController,EventController],
  providers: [EventService],
})
export class AppModule {}