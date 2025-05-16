import { IsString, IsNotEmpty, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @MinLength(6)
  readonly password: string;
}

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['user', 'operator', 'auditor', 'admin'])
  role: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}