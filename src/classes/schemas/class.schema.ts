import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type ClassDocument = Class & Document;

@Schema({ timestamps: true })
export class Class {
  @ApiProperty({ example: 'حصة يوجا للمبتدئين' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'حصة يوجا مناسبة للمبتدئين', required: false })
  @Prop()
  description: string;

  @ApiProperty({ example: 'مدرب يوجا' })
  @Prop({ required: true })
  instructor: string;

  @ApiProperty({ example: '2024-01-20T10:00:00.000Z' })
  @Prop({ required: true })
  startTime: Date;

  @ApiProperty({ example: '2024-01-20T11:00:00.000Z' })
  @Prop({ required: true })
  endTime: Date;

  @ApiProperty({ example: 20 })
  @Prop({ required: true, min: 1 })
  maxParticipants: number;

  @ApiProperty({ example: 5 })
  @Prop({ default: 0 })
  currentParticipants: number;

  @ApiProperty({ type: [String] })
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  participants: Types.ObjectId[];

  @ApiProperty({ example: 1 })
  @Prop({ required: true, min: 1 })
  creditsRequired: number;

  @ApiProperty({ example: true })
  @Prop({ default: true })
  isActive: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
