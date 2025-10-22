import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'معرف الحصة',
  })
  @IsMongoId()
  classId: string;
}
