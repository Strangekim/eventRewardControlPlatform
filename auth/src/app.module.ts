import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './app.controller';
import { AuthService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    // .env 파일 로드 (전역)
    ConfigModule.forRoot({ isGlobal: true }),

    // 비동기 방식으로 MONGO_URI 로드
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    // User 모델 등록
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
