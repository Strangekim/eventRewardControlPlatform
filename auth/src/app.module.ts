import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controller/public.controller';
import { InternalController } from './controller/internal.controller';
import { AuthService } from './app.service';
import { User, UserSchema } from './schemas/user.schema';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './role/roles.guard';

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
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '1h' },
      }),
    }),
  ],
  controllers: [AuthController,InternalController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
