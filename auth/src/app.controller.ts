import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './app.service';
import { CreateUserDto } from './dto/create_user.dto';
import { get } from 'mongoose';

@Controller('') // => /auth 경로 아래
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') 
  async register(
    @Body() createUserDto: CreateUserDto, ): Promise<{ message: string }> {
    await this.authService.register(createUserDto);
    return { message: '회원가입이 완료되었습니다.' };
  }

  @Get('ping') // → GET /auth/ping
  getPong() {
    return { message: '엔트리를 sdsdsdsdsdsd바꿨습니다' };
  }
}
