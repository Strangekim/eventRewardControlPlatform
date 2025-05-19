import { Controller, Post, Body, Get, Patch, Param,ForbiddenException  } from '@nestjs/common';
import { AuthService } from '../app.service';
import { CreateUserDto,UpdateUserRoleDto,LoginDto } from '../dto/user.dto';
import { CurrentUser } from '../common/current-user.decorator'
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../role/roles.decorator'; // 경로는 너 프로젝트 구조에 따라
import { RolesGuard } from '../role/roles.guard';
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
  @Roles('operator', 'admin')
  @Get('users')
  async getAllUsers(@CurrentUser() user) {
    return this.authService.findAllUsers();
  }

  // 역할 변경
  @Roles('admin')
  @Patch('user/:userId/role')
  async updateRoleById(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user,
  ) {
    return this.authService.updateUserRole(userId, dto);
  }

  // 로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
