import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../schemas/booking.schema';

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty()
  class: {
    id: string;
    title: string;
    instructor: string;
    startTime: Date;
    endTime: Date;
    creditsRequired: number;
  };

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  bookedAt: Date;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty()
  creditsUsed: number;

  @ApiProperty()
  creditsRefunded: boolean;

  @ApiProperty()
  participantsCount: number;

  @ApiProperty()
  availableSpots: number;
}
