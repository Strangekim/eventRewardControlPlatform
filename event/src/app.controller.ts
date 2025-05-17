import { Body, Controller, Post, Get, Param, Patch } from '@nestjs/common';
import { EventService } from './app.service';
import { Event } from './schemas/event.schemas';
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
  async deactivateEvent(@Param('id') id: string) {
    return this.eventService.deactivateEvent(id);
  }
}


@Controller('ping')
export class PingController {
  @Get()
  getPong() {
    return { message: 'akfkakfk사주세요' };
  }
}