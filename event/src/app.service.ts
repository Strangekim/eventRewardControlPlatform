import { Injectable,BadRequestException,NotFoundException, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Event, EventDocument } from './schemas/event.schemas';
import { CreateEventDto,CreateRewardDto } from './dto/event.dto'
import { Reward, RewardDocument } from './schemas/reward.schemas'
import { User, UserDocument } from './schemas/user.schemas';
import { RewardRequest, RewardRequestDocument } from './schemas/reward_request.schema'

@Injectable()
export class EventService {
  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly httpService: HttpService,
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

    // 예외 1: 이벤트 상태가 inactive
    if (event.status === 'inactive') {
      throw new BadRequestException('비활성화된 이벤트에는 보상을 추가할 수 없습니다.');
    }

    // 예외 2: 이벤트 종료 시간이 현재보다 과거
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

    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    if (event.status === 'inactive') {
      throw new BadRequestException('이미 비활성화된 이벤트입니다.');
    }

    event.status = 'inactive';
    await event.save();

    return event;
  }

  // 사용자 이벤트 참여
  async joinEvent(eventId: string, userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('올바르지 않은 이벤트 ID입니다.');
    }

    const event = await this.eventModel.findById(eventId).lean();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다.');
    }

    // auth-service에 요청 위임
    try {
      await firstValueFrom(
        this.httpService.patch(
          `http://auth:3000/internal/users/${userId}/event-progress/${eventId}/join`,
          {
            type: event.type,
            conditions: event.conditions,
          },
          {
            headers: {
              'x-internal-secret': process.env.INTERNAL_SECRET,
            },
          },
        ),
      );

      return { message: '이벤트 참여 완료', eventId };
    } catch (err) {
      const msg = err?.response?.data?.message || '이벤트 참여 실패';
      throw new BadRequestException(msg);
    }
  }


  // 이벤트 보상 요청
  async requestReward(eventId: string, userId: string): Promise<any> {
    const now = new Date();

    // 기본 유효성 검사
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('올바르지 않은 이벤트 ID입니다.');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('올바르지 않은 사용자 ID입니다.');
    }

    const rewardLogBase = {
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      processedAt: now,
    };

    try {
      // 🔁 auth-service에 내부 PATCH 요청
      await firstValueFrom(
        this.httpService.patch(
          `http://auth:3000/internal/users/${userId}/event-progress/${eventId}/reward`,
          {},
          {
            headers: {
              'x-internal-secret': process.env.INTERNAL_SECRET!,
            },
          },
        ),
      );

      // 보상 로그 성공 기록
      await this.rewardRequestModel.create({
        ...rewardLogBase,
        status: 'success',
      });

      return { message: '보상을 수령했습니다.' };
    } catch (err: any) {
      // ❌ 실패 로그 기록
      await this.rewardRequestModel.create({
        ...rewardLogBase,
        status: 'fail',
        reason: err?.response?.data?.message || err.message,
      });

      throw new BadRequestException(err?.response?.data?.message || err.message);
    }
  }

  // 나의 보상 요청 기록 보기
  async getMyRewardRequests(userId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('올바르지 않은 사용자 ID입니다.');
    }

    const requests = await this.rewardRequestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ processedAt: -1 }) // 최신 순 정렬
      .lean();

    return requests;
  }

  // 모든 보상 요청 기록 가져오기
  async getAllRewardRequests(): Promise<any[]> {
    const requests = await this.rewardRequestModel
      .find({})
      .sort({ processedAt: -1 }) // 최신순 정렬
      .lean();

    return requests;
  }

  // 이벤트 아이디로 특정 이벤트 보상 기록 조회하기
  async getRewardRequestsByEvent(eventId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('올바르지 않은 이벤트 ID입니다.');
    }

    return this.rewardRequestModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ processedAt: -1 })
      .lean();

  }

}
