import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'أحمد محمد' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({ example: 10, description: 'الرصيد الحالي' })
  @Prop({ default: 0 })
  credits: number;

  @ApiProperty({ example: 'user', description: 'دور المستخدم' })
  @Prop({ default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
