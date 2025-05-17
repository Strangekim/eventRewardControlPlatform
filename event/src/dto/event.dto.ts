import { IsMongoId, IsEnum, IsNumber, IsString, IsDateString, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions: Record<string, any>; // 동적 구조 허용

  @IsString()
  status: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;
}

export class CreateRewardDto {
  @IsMongoId()
  eventId: string;

  @IsEnum(['point', 'item', 'coupon'])
  rewardType: 'point' | 'item' | 'coupon';

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  itemCode?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsString()
  description: string;
}