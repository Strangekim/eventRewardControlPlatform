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

@Controller('pong')
export class PingController {
  @Get()
  getPong() {
    return { message: '탕탕후루후루' };
  }
}