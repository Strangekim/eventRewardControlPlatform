import { Body, Controller, Post, Get, Param, Patch, ForbiddenException } from '@nestjs/common';
import { EventService } from './app.service';
import { Event } from './schemas/event.schemas';
import { CurrentUser } from './common/current-user.decorator'
import { CreateEventDto,CreateRewardDto } from './dto/event.dto';
import { Roles } from './role/roles.decorator'; 

@Controller('')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  
  // 이벤트 생성
  @Roles('operator', 'admin')
  @Post('create')
  async createEvent(@Body() dto: CreateEventDto, @CurrentUser() user) {
    return this.eventService.createEvent(dto);
  }

  // 모든 이벤트 목록 가져오기
  @Roles('operator', 'admin')
  @Get()
  async getAllEvents(@CurrentUser() user) {
    return this.eventService.getAllEvents();
  }

  // 특정 이벤트 가져오기
  @Roles('operator', 'admin')
  @Get(':id')
  async getEventById(@Param('id') id: string,@CurrentUser() user) {
    return this.eventService.getEventById(id);
  }

  // 이벤트 보상 등록하기
  @Roles('operator', 'admin')
  @Post(':id/reward')
  async addRewardToEvent(@Param('id') id: string, @Body() dto: CreateRewardDto, @CurrentUser() user) {
    return this.eventService.createReward({ ...dto, eventId: id });
  }

  // 이벤트 마감하기
  @Roles('operator', 'admin')
  @Patch(':id/status')
  async deactivateEvent(@Param('id') id: string, @CurrentUser() user,) {
    return this.eventService.deactivateEvent(id);
  }

  // 이벤트 참여
  @Roles('user', 'admin')
  @Post(':id/join')
  async joinEvent(@Param('id') id: string, @CurrentUser() user) {
    return this.eventService.joinEvent(id, user.id);
  }

  // 이벤트 보상 수령
  @Roles('user', 'admin')
  @Post(':id/reward-request')
  async requestReward(@Param('id') id: string, @CurrentUser() user) {
    return this.eventService.requestReward(id, user.id);
  }

  // 내 이벤트 가져오기
  @Roles('user', 'admin')
  @Get('reward-request/mine')
  async getMyRewardRequests(@CurrentUser() user) {
    return this.eventService.getMyRewardRequests(user.id);
  }

  // 전체 보상 내역 가져오기
  @Roles('operator','auditor','admin')
  @Get('reward-request/all')
  async getAllRewardRequests(@CurrentUser() user) {
    return this.eventService.getAllRewardRequests();
  }

  // 이벤트 아이디로 특정 이벤트 보상 신청 내역 가져오기
  @Roles('operator','auditor','admin')
  @Get('reward-request/event/:eventId')
  async getRewardRequestsByEvent(@Param('eventId') eventId: string,@CurrentUser() user,) {
    return this.eventService.getRewardRequestsByEvent(eventId);
  }

}

