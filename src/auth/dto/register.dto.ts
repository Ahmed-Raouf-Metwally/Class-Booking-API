import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'أحمد محمد',
    description: 'اسم المستخدم الكامل',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'البريد الإلكتروني',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'كلمة المرور - يجب أن تكون至少 6 أحرف',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
