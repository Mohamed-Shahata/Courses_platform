import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import {
  COURSE_MESSAGE,
  ENROLLMENT_MESSAGE,
  USER_MESSAGES,
} from 'src/shared/constants/messages';

/**
 * Service responsible for managing course enrollments.
 *
 * Handles enrolling students in courses, listing a student's enrollments,
 * and canceling existing enrollments.
 * A student can only enroll once per course (enforced via unique constraint).
 */
export class EnrollmentService {
  constructor(private prisma: DataBaseService) {}

  /**
   * Enrolls a student in a course.
   *
   * - Verifies that both the course and student exist.
   * - Prevents duplicate enrollments using a composite unique key.
   *
   * @param courseId - The unique identifier of the course to enroll in.
   * @param studentId - The unique identifier of the student enrolling.
   * @returns An object containing the newly created enrollment record.
   * @throws {NotFoundException} If the course or student is not found.
   * @throws {BadRequestException} If the student is already enrolled in the course.
   */
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
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing)
      throw new BadRequestException(ENROLLMENT_MESSAGE.ENROLL_ALREADY);

    const enroll = await this.prisma.enrollment.create({
      data: {
        student: { connect: { id: studentId } },
        course: { connect: { id: courseId } },
      },
    });

    return { enroll };
  }

  /**
   * Retrieves all course enrollments for a specific student.
   *
   * @param studentId - The unique identifier of the student.
   * @returns An object containing an array of the student's enrollment records.
   * @throws {NotFoundException} If the student is not found.
   */
  public async allEnrollByStudent(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException(USER_MESSAGES.NOT_FOUND_ACCOUNT);

    const coursesEnroll = await this.prisma.enrollment.findMany({
      where: { student },
    });

    return { coursesEnroll };
  }

  /**
   * Cancels an existing enrollment for a student in a course.
   *
   * Permanently deletes the enrollment record from the database.
   *
   * @param courseId - The unique identifier of the course.
   * @param studentId - The unique identifier of the student.
   * @returns A success message confirming the cancellation.
   * @throws {NotFoundException} If no active enrollment is found for the given student and course.
   */
  public async cancelEnroll(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { courseId, studentId },
    });

    if (!enrollment)
      throw new NotFoundException(ENROLLMENT_MESSAGE.ENROLLMENT_NOT_FOUND);

    await this.prisma.enrollment.delete({ where: { id: enrollment.id } });

    return { message: ENROLLMENT_MESSAGE.ENROLLMENT_CANCELED_SUCCESS };
  }

  public async getAllCourseEnrolled() {
    const enrollments = await this.prisma.enrollment.findMany({
      include: {
        course: true,
      },
    });

    return { data: enrollments };
  }
}
