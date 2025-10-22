import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // إنشاء user جديد
  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserDocument> {
    const { name, email, password } = userData;

    // نتأكد إن الإيميل مش متكرر
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('الإيميل مستخدم من قبل');
    }

    // تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }

  // البحث عن user بالإيميل
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  // البحث عن user بالـ ID
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return user;
  }

  // إضافة كريديت للمستخدم
  async addCredits(userId: string, credits: number): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.credits += credits;
    return user.save();
  }

  // خصم كريديت من المستخدم
  async deductCredits(userId: string, credits: number): Promise<UserDocument> {
    const user = await this.findById(userId);

    if (user.credits < credits) {
      throw new Error('الرصيد غير كافي');
    }

    user.credits -= credits;
    return user.save();
  }

  // الحصول على بروفايل المستخدم بدون باسورد
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return user;
  }
}
