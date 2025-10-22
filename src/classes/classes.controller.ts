import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Classes - الحصص')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ✅ إنشاء حصة جديدة
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'إنشاء حصة جديدة',
    description: 'إنشاء حصة جديدة (تتطلب مصادقة)',
  })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الحصة بنجاح',
  })
  @ApiResponse({
    status: 409,
    description: 'تعارض في مواعيد المدرب',
  })
  @ApiBody({ type: CreateClassDto })
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  // ✅ الحصول على جميع الحصص النشطة
  @Get()
  @ApiOperation({
    summary: 'الحصول على جميع الحصص النشطة',
    description: 'عرض جميع الحصص النشطة مع إمكانية التصفية',
  })
  @ApiQuery({
    name: 'instructor',
    required: false,
    description: 'تصفية الحصص حسب المدرب',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'بحث في عنوان أو وصف الحصص',
  })
  @ApiResponse({
    status: 200,
    description: 'قائمة الحصص',
  })
  async findAll(
    @Query('instructor') instructor?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.classesService.searchClasses(search);
    }
    if (instructor) {
      return this.classesService.findByInstructor(instructor);
    }
    return this.classesService.findAll();
  }

  // ✅ الحصول على الحصص القادمة
  @Get('upcoming')
  @ApiOperation({
    summary: 'الحصول على الحصص القادمة',
    description: 'عرض الحصص القادمة في المستقبل',
  })
  async getUpcomingClasses() {
    return this.classesService.getUpcomingClasses();
  }

  // ✅ الحصول على حصة معينة
  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على حصة معينة',
    description: 'عرض تفاصيل حصة معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  @ApiResponse({
    status: 200,
    description: 'تفاصيل الحصة',
  })
  @ApiResponse({
    status: 404,
    description: 'الحصة غير موجودة',
  })
  async findOne(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  // ✅ تحديث حصة
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'تحديث حصة',
    description: 'تحديث بيانات حصة معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الحصة بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الحصة غير موجودة',
  })
  @ApiResponse({
    status: 409,
    description: 'تعارض في مواعيد المدرب',
  })
  @ApiBody({ type: UpdateClassDto })
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  // ✅ حذف حصة
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'حذف حصة',
    description: 'حذف حصة معينة (فقط إذا لم يكن بها مشاركين)',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  @ApiResponse({
    status: 200,
    description: 'تم حذف الحصة بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'الحصة غير موجودة',
  })
  @ApiResponse({
    status: 409,
    description: 'لا يمكن حذف حصة بها مشاركين',
  })
  async remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  // ✅ تعطيل/تفعيل حصة
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'تعطيل/تفعيل حصة',
    description: 'تعطيل أو تفعيل حصة معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.classesService.toggleClassStatus(id, isActive);
  }

  // ✅ الحصول على إحصائيات الحصة
  @Get(':id/stats')
  @ApiOperation({
    summary: 'إحصائيات الحصة',
    description: 'الحصول على إحصائيات مفصلة عن حصة معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  async getStats(@Param('id') id: string) {
    return this.classesService.getClassStats(id);
  }

  // ✅ الحصول على المشاركين في الحصة
  @Get(':id/participants')
  @ApiOperation({
    summary: 'المشاركين في الحصة',
    description: 'عرض جميع المشاركين في حصة معينة',
  })
  @ApiParam({ name: 'id', description: 'معرف الحصة' })
  async getParticipants(@Param('id') id: string) {
    const classItem = await this.classesService.findByIdWithParticipants(id);
    return {
      class: {
        id: classItem._id,
        title: classItem.title,
        instructor: classItem.instructor,
      },
      participants: classItem.participants,
      participantsCount: classItem.currentParticipants,
      maxParticipants: classItem.maxParticipants,
      availableSpots: classItem.maxParticipants - classItem.currentParticipants,
    };
  }

  // ✅ الحصول على الحصص المتاحة
  @Get('available')
  @ApiOperation({
    summary: 'الحصص المتاحة',
    description: 'عرض الحصص التي بها أماكن متاحة',
  })
  async findAvailable() {
    const classes = await this.classesService.findAll();
    return classes.filter(
      (cls) => cls.currentParticipants < cls.maxParticipants,
    );
  }

  // ✅ الحصول على جميع الحصص (بما فيها غير النشطة) - للإدمن
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'جميع الحصص (للإدمن)',
    description: 'عرض جميع الحصص بما فيها غير النشطة',
  })
  async findAllForAdmin() {
    return this.classesService.findAllWithInactive();
  }
}
