import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User,UserDocument } from './schemas/user.schema'
import { CreateUserDto } from './dto/create_user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
}
