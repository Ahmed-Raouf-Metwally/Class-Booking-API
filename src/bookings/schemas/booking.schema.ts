import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from '../../classes/schemas/class.schema';
import { ApiProperty } from '@nestjs/swagger';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Booking {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  class: Class;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @Prop({ default: BookingStatus.CONFIRMED })
  status: BookingStatus;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  @Prop({ default: Date.now })
  bookedAt: Date;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', required: false })
  @Prop()
  cancelledAt: Date;

  @ApiProperty({ example: false })
  @Prop({ default: false })
  creditsRefunded: boolean;

  @ApiProperty({ example: 1 })
  @Prop({ required: true })
  creditsUsed: number;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Index for better query performance
BookingSchema.index({ user: 1, class: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'class.startTime': 1 });
