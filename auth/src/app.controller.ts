import { Controller, Post, Body, Get, Patch, Param,ForbiddenException  } from '@nestjs/common';
import { AuthService } from './app.service';
import { CreateUserDto,UpdateUserRoleDto,LoginDto } from './dto/create_user.dto';
import { CurrentUser } from './common/current-user.decorator'
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

  @Get('login') // → GET /auth/ping
  getPong() {
    return { message: '엔트리를 sdsdsdsdsdsd바꿨습니다' };
  }

  @Get('users')
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  // 롤 변경
  @Patch('user/:username/role')
  async updateRole(
    @Param('username') username: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user,
  ) {
    console.log(user)
    if (user.role !== 'admin') {
    throw new ForbiddenException('관리자만 역할 변경이 가능합니다.');
  }

    return this.authService.updateUserRole(username, dto);
  }

  // 로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
