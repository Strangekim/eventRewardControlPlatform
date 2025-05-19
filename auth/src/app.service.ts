import { Injectable, ConflictException,BadRequestException,NotFoundException,UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User,UserDocument } from './schemas/user.schema'
import { CreateUserDto,UpdateUserRoleDto,LoginDto  } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService, 
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const { username, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자 이름입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      password: hashedPassword
    });

    await newUser.save();
  }

  // 모든 사용자 검색
  async findAllUsers(): Promise<Partial<UserDocument>[]> {
    return this.userModel
      .find({}, { password: 0, __v: 0 }) // 비밀번호와 버전 필드는 제외
  }

  // 사용자 역할 업데이트
  async updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<{ message: string }> {
    console.log(userId)
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { role: dto.role },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('해당 ID를 가진 사용자를 찾을 수 없습니다.');
    }

    return { message: `사용자 역할이 '${dto.role}'로 변경되었습니다.` };
  }

  // 로그인 로직
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ username: dto.username });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return { accessToken: token };
  }

  // 유저 event에 참여
  async joinUserToEvent(
    userId: string,
    eventId: string,
    type: string,
    conditions: Record<string, any>,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('사용자 없음');

    const alreadyJoined = user.eventProgress.some(
      (p) => p.eventId.toString() === eventId,
    );
    if (alreadyJoined) {
      throw new BadRequestException('이미 참여한 이벤트입니다.');
    }
    
    user.eventProgress.push({
      eventId: eventId,
      type,
      current: conditions,
      lastUpdated: new Date(),
      rewardReceived: false,
    });

    await user.save();

    return { message: '이벤트 참여 완료' };
  }

  // 보상 추가
  async markRewardReceived(userId: string, eventId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const progressIndex = user.eventProgress.findIndex(
      (p) => p.eventId.toString() === eventId,
    );
    if (progressIndex === -1) {
      throw new ForbiddenException('해당 이벤트에 참여하지 않았습니다.');
    }

    const progress = user.eventProgress[progressIndex];
    if (progress.rewardReceived) {
      throw new ForbiddenException('이미 보상을 수령했습니다.');
    }

    user.eventProgress[progressIndex].rewardReceived = true;
    user.markModified('eventProgress');
    await user.save();

    return { message: '보상 상태 갱신 완료' };
  }
}
