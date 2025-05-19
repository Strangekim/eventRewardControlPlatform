import { Body, Controller, Post, Get, Param, Patch, ForbiddenException } from '@nestjs/common';
import { EventService } from './app.service';
import { Event } from './schemas/event.schemas';
import { CurrentUser } from './common/current-user.decorator'
import { CreateEventDto,CreateRewardDto } from './dto/event.dto';

@Controller('')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  
  // 이벤트 생성
  @Post('create')
  async createEvent(@Body() dto: CreateEventDto, @CurrentUser() user) {
    
    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.createEvent(dto);
  }

  // 모든 이벤트 목록 가져오기
  @Get()
  async getAllEvents(@CurrentUser() user) {

    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.getAllEvents();
  }

  // 특정 이벤트 가져오기
  @Get(':id')
  async getEventById(@Param('id') id: string,@CurrentUser() user) {

    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.getEventById(id);
  }

  // 이벤트 보상 등록하기
  @Post(':id/reward')
  async addRewardToEvent(@Param('id') id: string, @Body() dto: CreateRewardDto, @CurrentUser() user) {

    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.createReward({ ...dto, eventId: id });
  }

  // 이벤트 마감하기
  @Patch(':id/status')
  async deactivateEvent(@Param('id') id: string, @CurrentUser() user,) {

    if (!['operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('운영자,관리자만 사용할 수 있습니다.');
    }
    
    return this.eventService.deactivateEvent(id);
  }

  // 이벤트 참여
  @Post(':id/join')
  async joinEvent(@Param('id') id: string, @CurrentUser() user) {

    if (!['user', 'admin'].includes(user.role)) {
      throw new ForbiddenException('관리자,사용자만 사용할 수 있습니다.');
    }

    return this.eventService.joinEvent(id, user.id);
  }

  // 이벤트 보상 수령
  @Post(':id/reward-request')
  async requestReward(@Param('id') id: string, @CurrentUser() user) {

    if (!['user', 'admin'].includes(user.role)) {
      throw new ForbiddenException('관리자,사용자만 사용할 수 있습니다.');
    }

    return this.eventService.requestReward(id, user.id);
  }

  // 내 이벤트 가져오기
  @Get('reward-request/mine')
  async getMyRewardRequests(@CurrentUser() user) {

    if (!['user', 'admin'].includes(user.role)) {
      throw new ForbiddenException('관리자,사용자만 사용할 수 있습니다.');
    }

    return this.eventService.getMyRewardRequests(user.id);
  }

  // 전체 보상 내역 가져오기
  @Get('reward-request/all')
  async getAllRewardRequests(@CurrentUser() user) {

    if (!['operator', 'admin','auditor'].includes(user.role)) {
      throw new ForbiddenException('운영자,감시자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.getAllRewardRequests();
  }

  // 이벤트 아이디로 특정 이벤트 보상 신청 내역 가져오기
  @Get('reward-request/event/:eventId')
  async getRewardRequestsByEvent(@Param('eventId') eventId: string,@CurrentUser() user,) {

    if (!['operator', 'admin','auditor'].includes(user.role)) {
      throw new ForbiddenException('운영자,감시자,관리자만 사용할 수 있습니다.');
    }

    return this.eventService.getRewardRequestsByEvent(eventId);
  }

}

