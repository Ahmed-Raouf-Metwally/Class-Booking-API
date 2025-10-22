import {
  IsString,
  IsDateString,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'حصة يوجا للمبتدئين' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'حصة يوجا مناسبة للمبتدئين', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'مدرب يوجا' })
  @IsString()
  instructor: string;

  @ApiProperty({ example: '2024-01-20T10:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-01-20T11:00:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ example: 20, minimum: 1 })
  @IsNumber()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  creditsRequired: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
