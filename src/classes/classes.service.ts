import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  // ✅ إنشاء حصة جديدة
  async create(createClassDto: CreateClassDto): Promise<ClassDocument> {
    const { startTime, endTime, instructor } = createClassDto;

    // التحقق من overlapping classes
    const hasOverlap = await this.checkInstructorAvailability(
      instructor,
      new Date(startTime),
      new Date(endTime),
    );

    if (hasOverlap) {
      throw new ConflictException('المدرب لديه حصة أخرى في هذا التوقيت');
    }

    return this.classModel.create(createClassDto);
  }

  // ✅ الحصول على جميع الحصص
  async findAll(): Promise<ClassDocument[]> {
    return this.classModel
      .find({ isActive: true })
      .select('-participants')
      .sort({ startTime: 1 })
      .exec();
  }

  // ✅ الحصول على جميع الحصص (بما فيها غير النشطة) - للإدمن
  async findAllWithInactive(): Promise<ClassDocument[]> {
    return this.classModel.find().sort({ createdAt: -1 }).exec();
  }

  // ✅ الحصول على حصة بالـ ID
  async findById(id: string): Promise<ClassDocument> {
    const classItem = await this.classModel.findById(id);
    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }
    return classItem;
  }

  // ✅ الحصول على حصة مع participants data
  async findByIdWithParticipants(id: string): Promise<ClassDocument> {
    const classItem = await this.classModel
      .findById(id)
      .populate('participants', 'name email');
    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }
    return classItem;
  }

  // ✅ كرد أوبريشن - التسجيل في الحصة
  async registerToClass(
    classId: string,
    userId: string,
  ): Promise<{ class: ClassDocument; participantsCount: number }> {
    let classItem = await this.classModel.findById(classId);

    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    // التحقق إذا User مسجل already
    if (classItem.participants.includes(new Types.ObjectId(userId))) {
      throw new ConflictException('المستخدم مسجل already في هذه الحصة');
    }

    // التحقق إذا الحصة full
    if (classItem.currentParticipants >= classItem.maxParticipants) {
      throw new ConflictException('الحصة ممتلئة');
    }

    // كرد أوبريشن - تحديث الـ counter والـ array في نفس الوقت
    classItem = await this.classModel.findByIdAndUpdate(
      classId,
      {
        $inc: { currentParticipants: 1 },
        $push: { participants: userId },
      },
      { new: true },
    );

    // التحقق إذا الـ update اتعمل بنجاح
    if (!classItem) {
      throw new NotFoundException('فشل في تحديث الحصة');
    }

    return {
      class: classItem,
      participantsCount: classItem.currentParticipants,
    };
  }

  // ✅ كرد أوبريشن - إلغاء التسجيل
  async cancelRegistration(
    classId: string,
    userId: string,
  ): Promise<{ class: ClassDocument; participantsCount: number }> {
    let classItem = await this.classModel.findById(classId);

    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    // التحقق إذا User مش مسجل
    if (!classItem.participants.includes(new Types.ObjectId(userId))) {
      throw new ConflictException('المستخدم غير مسجل في هذه الحصة');
    }

    // كرد أوبريشن - تحديث الـ counter والـ array في نفس الوقت
    classItem = await this.classModel.findByIdAndUpdate(
      classId,
      {
        $inc: { currentParticipants: -1 },
        $pull: { participants: userId },
      },
      { new: true },
    );

    // التحقق إذا الـ update اتعمل بنجاح
    if (!classItem) {
      throw new NotFoundException('فشل في تحديث الحصة');
    }

    return {
      class: classItem,
      participantsCount: classItem.currentParticipants,
    };
  }

  // ✅ تحديث حصة
  async update(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassDocument> {
    const classItem = await this.classModel.findById(id);
    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    const { startTime, endTime, instructor, ...updateData } = updateClassDto;

    // التحقق من overlapping classes إذا تم تحديث الوقت أو المدرب
    if (startTime || endTime || instructor) {
      const newStartTime = startTime
        ? new Date(startTime)
        : classItem.startTime;
      const newEndTime = endTime ? new Date(endTime) : classItem.endTime;
      const newInstructor = instructor || classItem.instructor;

      const hasOverlap = await this.checkInstructorAvailability(
        newInstructor,
        newStartTime,
        newEndTime,
        id, // exclude current class
      );

      if (hasOverlap) {
        throw new ConflictException('المدرب لديه حصة أخرى في هذا التوقيت');
      }
    }

    // التحقق إذا فيه حجوزات active قبل ما نعطل الحصة
    if (updateData.isActive === false && classItem.currentParticipants > 0) {
      throw new ConflictException('لا يمكن تعطيل حصة بها مشاركين مسجلين');
    }

    const updatedClass = await this.classModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedClass) {
      throw new NotFoundException('فشل في تحديث الحصة');
    }

    return updatedClass;
  }

  // ✅ حذف حصة
  async remove(id: string): Promise<{ message: string }> {
    const classItem = await this.classModel.findById(id);

    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    // التحقق إذا فيه حجوزات active قبل الحذف
    if (classItem.currentParticipants > 0) {
      throw new ConflictException('لا يمكن حذف حصة بها مشاركين مسجلين');
    }

    await this.classModel.findByIdAndDelete(id);

    return { message: 'تم حذف الحصة بنجاح' };
  }

  // ✅ تعطيل/تفعيل حصة
  async toggleClassStatus(
    id: string,
    isActive: boolean,
  ): Promise<ClassDocument> {
    const classItem = await this.classModel.findById(id);

    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    if (!isActive && classItem.currentParticipants > 0) {
      throw new ConflictException('لا يمكن تعطيل حصة بها مشاركين مسجلين');
    }

    const updatedClass = await this.classModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );

    if (!updatedClass) {
      throw new NotFoundException('فشل في تحديث الحصة');
    }

    return updatedClass;
  }

  // ✅ الحصول على إحصائيات الحصة
  async getClassStats(id: string): Promise<any> {
    const classItem = await this.classModel
      .findById(id)
      .populate('participants', 'name email');

    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }

    return {
      class: {
        id: classItem._id,
        title: classItem.title,
        instructor: classItem.instructor,
      },
      participants: {
        count: classItem.currentParticipants,
        list: classItem.participants,
        max: classItem.maxParticipants,
        available: classItem.maxParticipants - classItem.currentParticipants,
      },
      timing: {
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        duration:
          (classItem.endTime.getTime() - classItem.startTime.getTime()) /
            (1000 * 60 * 60) +
          ' ساعة',
      },
      revenue: classItem.currentParticipants * classItem.creditsRequired,
    };
  }

  // ✅ البحث في الحصص
  async searchClasses(query: string): Promise<ClassDocument[]> {
    return this.classModel
      .find({
        isActive: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { instructor: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ startTime: 1 })
      .exec();
  }

  // ✅ الحصول على حصص المدرب
  async findByInstructor(instructor: string): Promise<ClassDocument[]> {
    return this.classModel
      .find({ instructor, isActive: true })
      .sort({ startTime: 1 })
      .exec();
  }

  // ✅ الحصول على الحصص القادمة
  async getUpcomingClasses(): Promise<ClassDocument[]> {
    return this.classModel
      .find({
        isActive: true,
        startTime: { $gt: new Date() },
      })
      .sort({ startTime: 1 })
      .limit(10)
      .exec();
  }

  // ✅ التحقق إذا الحصة full
  isClassFull(classItem: ClassDocument): boolean {
    return classItem.currentParticipants >= classItem.maxParticipants;
  }

  // ✅ التحقق إذا user مسجل في الحصة
  isUserRegistered(classItem: ClassDocument, userId: string): boolean {
    return classItem.participants.some(
      (participant) => participant.toString() === userId,
    );
  }

  // ✅ الحصول على عدد المشاركين فقط
  async getParticipantsCount(classId: string): Promise<number> {
    const classItem = await this.classModel.findById(classId);
    if (!classItem) {
      throw new NotFoundException('الحصة غير موجودة');
    }
    return classItem.currentParticipants;
  }

  // ✅ method مساعدة: التحقق من overlapping classes
  private async checkInstructorAvailability(
    instructor: string,
    startTime: Date,
    endTime: Date,
    excludeClassId?: string,
  ): Promise<boolean> {
    const query: any = {
      instructor,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      isActive: true,
    };

    if (excludeClassId) {
      query._id = { $ne: excludeClassId };
    }

    const overlappingClass = await this.classModel.findOne(query);
    return !!overlappingClass;
  }
}
