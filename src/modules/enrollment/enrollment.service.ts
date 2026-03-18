import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import {
  COURSE_MESSAGE,
  ENROLLMENT_MESSAGE,
  USER_MESSAGES,
} from 'src/shared/constants/messages';

export class EnrollmentService {
  constructor(private prisma: DataBaseService) {}

  public async enrollCourse(courseId: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
    if (existing)
      throw new BadRequestException(ENROLLMENT_MESSAGE.ENROLL_ALREADY);

    const enroll = await this.prisma.enrollment.create({
      data: {
        student: {
          connect: {
            id: studentId,
          },
        },
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });

    return { enroll };
  }

  public async AllEnrollByStudent(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const coursesEnroll = await this.prisma.enrollment.findMany({
      where: {
        student,
      },
    });

    return { coursesEnroll };
  }
}
