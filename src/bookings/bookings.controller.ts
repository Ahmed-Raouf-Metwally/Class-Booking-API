import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bookings - الحجوزات')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'حجز حصة جديدة',
    description: 'حجز حصة جديدة مع التحقق من الشروط',
  })
  @ApiResponse({
    status: 201,
    description: 'تم الحجز بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة',
  })
  @ApiResponse({
    status: 409,
    description: 'الحصة ممتلئة أو يوجد تعارض في المواعيد',
  })
  async bookClass(@Req() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.bookClass(req.user.userId, createBookingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'الحصول على حجوزات المستخدم',
    description: 'عرض جميع حجوزات المستخدم الحالي',
  })
  @ApiResponse({
    status: 200,
    description: 'قائمة الحجوزات',
  })
  async getUserBookings(@Req() req) {
    return this.bookingsService.getUserBookings(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على حجز معين',
    description: 'عرض تفاصيل حجز معين للمستخدم الحالي',
  })
  @ApiParam({ name: 'id', description: 'معرف الحجز' })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل الحجز',
  })
  @ApiResponse({
    status: 404,
    description: 'الحجز غير موجود',
  })
  async getBookingById(@Req() req, @Param('id') id: string) {
    return this.bookingsService.getBookingById(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'إلغاء الحجز',
    description: 'إلغاء حجز معين مع استرداد الرصيد إذا كان قبل ساعتين من الحصة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحجز' })
  @ApiResponse({
    status: 200,
    description: 'تم الإلغاء بنجاح',
  })
  @ApiResponse({
    status: 400,
    description: 'لا يمكن الإلغاء قبل ساعتين من الحصة',
  })
  @ApiResponse({
    status: 404,
    description: 'الحجز غير موجود',
  })
  async cancelBooking(@Req() req, @Param('id') id: string) {
    return this.bookingsService.cancelBooking(id, req.user.userId);
  }
}
