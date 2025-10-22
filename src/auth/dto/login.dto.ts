import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'البريد الإلكتروني',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'كلمة المرور',
  })
  @IsString()
  password: string;
}
