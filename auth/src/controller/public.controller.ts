import { Controller, Post, Body, Get, Patch, Param,ForbiddenException  } from '@nestjs/common';
import { AuthService } from '../app.service';
import { CreateUserDto,UpdateUserRoleDto,LoginDto } from '../dto/user.dto';
import { CurrentUser } from '../common/current-user.decorator'
import { get } from 'mongoose';

@Controller('') // => /auth 경로 아래
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원 가입
  @Post('register') 
  async register(
    @Body() createUserDto: CreateUserDto, ): Promise<{ message: string }> {
    await this.authService.register(createUserDto);
    return { message: '회원가입이 완료되었습니다.' };
  }

  // 전체 사용자 계정 정보 가져오기
  @Get('users')
  async getAllUsers(@CurrentUser() user) {

    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }
    
    return this.authService.findAllUsers();
  }

  // 역할 변경
  @Patch('user/:userId/role')
  async updateRoleById(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user, // admin 검증은 여기서
  ) {

    if (user.role !== 'admin') {
      throw new ForbiddenException('관리자만 역할 변경이 가능합니다.');
    }

    return this.authService.updateUserRole(userId, dto);
  }

  // 로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
