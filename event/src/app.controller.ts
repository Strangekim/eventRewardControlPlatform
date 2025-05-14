import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('ping')
export class PingController {
  @Get()
  getPong() {
    return { message: '마라탕사주세요' };
  }
}