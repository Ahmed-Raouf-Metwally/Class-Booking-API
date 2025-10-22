import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';
import { UsersService } from '../users/users.service';
import { ClassesService } from '../classes/classes.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private usersService: UsersService,
    private classesService: ClassesService,
  ) {}

  async bookClass(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<any> {
    const { classId } = createBookingDto;

    const classToBook = await this.classesService.findById(classId);

    if (!classToBook.isActive) {
      throw new BadRequestException('الحصة غير نشطة');
    }

    // التحقق إذا الحصة full
    if (this.classesService.isClassFull(classToBook)) {
      throw new ConflictException('الحصة ممتلئة');
    }

    // التحقق إذا user مسجل already
    if (this.classesService.isUserRegistered(classToBook, userId)) {
      throw new ConflictException('أنت مسجل already في هذه الحصة');
    }

    // التحقق من overlapping classes
    const hasOverlapping = await this.checkOverlappingClasses(
      userId,
      classToBook,
    );
    if (hasOverlapping) {
      throw new ConflictException('لديك حصة أخرى في هذا التوقيت');
    }

    // التحقق من الرصيد
    const user = await this.usersService.findById(userId);
    if (user.credits < classToBook.creditsRequired) {
      throw new ConflictException('رصيدك غير كافي');
    }

    // خصم الكريديت
    await this.usersService.deductCredits(userId, classToBook.creditsRequired);

    try {
      // كرد أوبريشن - التسجيل في الحصة
      const registrationResult = await this.classesService.registerToClass(
        classId,
        userId,
      );

      // إنشاء booking record
      const booking = await this.bookingModel.create({
        user: userId,
        class: classId,
        creditsUsed: classToBook.creditsRequired,
      });

      const populatedBooking = await booking.populate([
        { path: 'user', select: 'name email' },
        {
          path: 'class',
          select:
            'title instructor startTime endTime creditsRequired maxParticipants',
        },
      ]);

      return {
        booking: populatedBooking,
        participantsCount: registrationResult.participantsCount,
        availableSpots:
          classToBook.maxParticipants - registrationResult.participantsCount,
      };
    } catch (error) {
      // Refund credits if booking fails
      await this.usersService.addCredits(userId, classToBook.creditsRequired);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, userId: string): Promise<any> {
    const booking = await this.bookingModel
      .findOne({
        _id: bookingId,
        user: userId,
        status: BookingStatus.CONFIRMED,
      })
      .populate('class');

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    const classData = booking.class as any;

    // التحقق إذا الـ class لسه موجود
    let classItem;
    try {
      classItem = await this.classesService.findById(classData._id.toString());
    } catch (error) {
      throw new NotFoundException('الحصة المرتبطة بهذا الحجز غير موجودة');
    }

    const classStartTime = new Date(classData.startTime);
    const now = new Date();
    const hoursUntilClass =
      (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < 2) {
      throw new BadRequestException(
        'لا يمكن الإلغاء قبل ساعتين من بداية الحصة',
      );
    }

    // كرد أوبريشن - إلغاء التسجيل
    const cancellationResult = await this.classesService.cancelRegistration(
      classData._id.toString(),
      userId,
    );

    // Refund credits
    await this.usersService.addCredits(userId, booking.creditsUsed);

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.creditsRefunded = true;

    const updatedBooking = await booking.save();

    return {
      booking: updatedBooking,
      participantsCount: cancellationResult.participantsCount,
      availableSpots:
        classItem.maxParticipants - cancellationResult.participantsCount,
      creditsRefunded: booking.creditsUsed,
    };
  }

  async getUserBookings(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ user: userId })
      .populate([
        { path: 'user', select: 'name email' },
        {
          path: 'class',
          select:
            'title instructor startTime endTime creditsRequired currentParticipants maxParticipants',
        },
      ])
      .sort({ bookedAt: -1 })
      .exec();
  }

  async getBookingById(
    bookingId: string,
    userId: string,
  ): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findOne({ _id: bookingId, user: userId })
      .populate([
        { path: 'user', select: 'name email' },
        {
          path: 'class',
          select:
            'title instructor startTime endTime creditsRequired currentParticipants maxParticipants',
        },
      ]);

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    return booking;
  }

  private async checkOverlappingClasses(
    userId: string,
    newClass: any,
  ): Promise<boolean> {
    const existingBookings = await this.bookingModel
      .find({
        user: userId,
        status: BookingStatus.CONFIRMED,
      })
      .populate('class')
      .exec();

    for (const booking of existingBookings) {
      const existingClass = booking.class as any;

      if (
        newClass.startTime < existingClass.endTime &&
        newClass.endTime > existingClass.startTime
      ) {
        return true;
      }
    }

    return false;
  }

  async getClassBookings(classId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ class: classId, status: BookingStatus.CONFIRMED })
      .populate('user', 'name email')
      .exec();
  }

  // method جديدة: الحصول على booking statistics
  async getUserBookingStats(userId: string): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    totalCreditsUsed: number;
  }> {
    const stats = await this.bookingModel.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCredits: { $sum: '$creditsUsed' },
        },
      },
    ]);

    const result = {
      totalBookings: 0,
      upcomingBookings: 0,
      cancelledBookings: 0,
      totalCreditsUsed: 0,
    };

    stats.forEach((stat) => {
      result.totalBookings += stat.count;
      result.totalCreditsUsed += stat.totalCredits;

      if (stat._id === BookingStatus.CONFIRMED) {
        result.upcomingBookings = stat.count;
      } else if (stat._id === BookingStatus.CANCELLED) {
        result.cancelledBookings = stat.count;
      }
    });

    return result;
  }
}
