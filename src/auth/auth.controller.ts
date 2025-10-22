import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth - المصادقة')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'تسجيل مستخدم جديد',
    description: 'إنشاء حساب جديد للمستخدم',
  })
  @ApiResponse({
    status: 201,
    description: 'تم تسجيل المستخدم بنجاح',
  })
  @ApiResponse({
    status: 409,
    description: 'البريد الإلكتروني مستخدم من قبل',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'تسجيل الدخول',
    description: 'تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تسجيل الدخول بنجاح',
  })
  @ApiResponse({
    status: 401,
    description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
