import { Body, Controller, Post, Get, Param, Patch, ForbiddenException } from '@nestjs/common';
import { EventService } from './app.service';
import { Event } from './schemas/event.schemas';
import { CurrentUser } from './common/current-user.decorator'
import { CreateEventDto,CreateRewardDto } from './dto/event.dto';

@Controller('')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  async createEvent(@Body() dto: CreateEventDto) {
    return this.eventService.createEvent(dto);
  }

  @Get()
  async getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Post(':id/reward')
  async addRewardToEvent(@Param('id') id: string, @Body() dto: CreateRewardDto) {
    return this.eventService.createReward({ ...dto, eventId: id });
  }

  @Patch(':id/status')
  async deactivateEvent(@Param('id') id: string, @CurrentUser() user,) {
    console.log(user)
    if (user.role !== 'admin') {
      throw new ForbiddenException('관리자만 역할 변경이 가능합니다.');
    }
    return this.eventService.deactivateEvent(id);
  }

  // 이벤트 참여
  @Post(':id/join')
  async joinEvent(@Param('id') id: string, @CurrentUser() user) {
    if (user.role !== 'user' && user.role !== 'admin') {
      throw new ForbiddenException('사용자만 이벤트 참여가 가능합니다.');
    }
    return this.eventService.joinEvent(id, user.id);
  }
}


@Controller('ping')
export class PingController {
  @Get()
  getPong() {
    return { message: 'akfkakfk사주세요' };
  }
}