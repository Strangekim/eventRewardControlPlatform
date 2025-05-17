import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schemas';
import { CreateEventDto,CreateRewardDto } from './dto/event.dto'
import { Reward, RewardDocument } from './schemas/reward.schemas'

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  // 이벤트 생성하기
  async createEvent(eventData: CreateEventDto): Promise<Event> {
    const created = new this.eventModel({
      ...eventData,
      startAt: new Date(eventData.startAt),
      endAt: new Date(eventData.endAt),
    });
    return created.save();
  }

  // 모든 이벤트 가져오기
  async getAllEvents(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  // 특정 이벤트만 가져오기
  async getEventById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('올바르지 않은 이벤트 ID입니다.');
    }

    const event = await this.eventModel.findById(id).lean();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    const rewards = await this.rewardModel.find({ eventId: id }).lean();

    return {
      ...event,
      rewards,
    };
  }

  // 이벤트에 보상 추가
  async createReward(dto: CreateRewardDto): Promise<Reward> {
    const event = await this.eventModel.findById(dto.eventId).lean();
    if (!event) {
      throw new BadRequestException('해당 이벤트가 존재하지 않습니다.');
    }

    // ✅ 예외 1: 이벤트 상태가 inactive
    if (event.status === 'inactive') {
      throw new BadRequestException('비활성화된 이벤트에는 보상을 추가할 수 없습니다.');
    }

    // ✅ 예외 2: 이벤트 종료 시간이 현재보다 과거
    const now = new Date();
    if (event.endAt && new Date(event.endAt) < now) {
      throw new BadRequestException('이미 종료된 이벤트에는 보상을 추가할 수 없습니다.');
    }

    const reward = new this.rewardModel(dto);
    return reward.save();
  }

  // 이벤트 상태 변경
  async deactivateEvent(id: string): Promise<Event> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('올바르지 않은 이벤트 ID입니다.');
    }

    const updated = await this.eventModel.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }, // ← 업데이트된 문서 반환
    ).exec();

    if (!updated) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    return updated;
  }

}
