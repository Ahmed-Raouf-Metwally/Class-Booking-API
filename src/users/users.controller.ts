import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddCreditsDto } from './dto/add-credits.dto';

@ApiTags('Users - المستخدمين')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'الحصول على بيانات المستخدم',
    description: 'الحصول على الملف الشخصي للمستخدم الحالي',
  })
  @ApiResponse({
    status: 200,
    description: 'بيانات المستخدم',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح - توكن غير صالح',
  })
  async getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('credits')
  @ApiOperation({
    summary: 'إضافة رصيد للمستخدم',
    description: 'إضافة رصيد إلى حساب المستخدم الحالي',
  })
  @ApiResponse({
    status: 200,
    description: 'تم إضافة الرصيد بنجاح',
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح',
  })
  @ApiBody({ type: AddCreditsDto })
  async addCredits(@Req() req, @Body() addCreditsDto: AddCreditsDto) {
    return this.usersService.addCredits(req.user.userId, addCreditsDto.credits);
  }

  @Get('credits')
  @ApiOperation({
    summary: 'الحصول على رصيد المستخدم',
    description: 'عرض الرصيد الحالي للمستخدم',
  })
  @ApiResponse({
    status: 200,
    description: 'الرصيد الحالي',
  })
  async getCredits(@Req() req) {
    const user = await this.usersService.findById(req.user.userId);
    return { credits: user.credits };
  }
}
