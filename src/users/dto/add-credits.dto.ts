import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCreditsDto {
  @ApiProperty({
    example: 10,
    description: 'عدد الرصيد المضاف',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  credits: number;
}
