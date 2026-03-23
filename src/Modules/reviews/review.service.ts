import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { addReviewDTO } from './dto/addReview.dto';
import {
  COURSE_MESSAGE,
  REVIEW_MESSAGE,
  USER_MESSAGES,
} from 'src/shared/constants/messages';
import { updateReviewDTO } from './dto/updateReview.dto';

/**
 * Service responsible for managing course reviews.
 *
 * Handles creating, reading, updating, and deleting reviews.
 * Each student can submit only one review per course (enforced via a composite unique constraint).
 * Students can only update or delete their own reviews.
 *
 * @injectable
 */
@Injectable()
export class ReviewServices {
  constructor(private prisma: DataBaseService) {}

  /**
   * Creates a new review for a course by a student.
   *
   * - Verifies that both the student and course exist.
   * - Prevents duplicate reviews using a `studentId_courseId` composite unique key.
   *
   * @param dto - DTO containing the `rating` and optional `comment`.
   * @param studentId - The ID of the student submitting the review.
   * @param courseId - The ID of the course being reviewed.
   * @returns An object containing the newly created review record.
   * @throws {BadRequestException} If the student or course is not found, or the student has already reviewed the course.
   */
  public async createReview(
    dto: addReviewDTO,
    studentId: string,
    courseId: string,
  ) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_STUDENT);

    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new BadRequestException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const existing = await this.prisma.review.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing)
      throw new BadRequestException(REVIEW_MESSAGE.REVIEWED_ALREADY);

    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        student: { connect: { id: studentId } },
        course: { connect: { id: courseId } },
      },
    });

    return { data: review };
  }

  /**
   * Retrieves all reviews for a specific course.
   *
   * @param courseId - The unique identifier of the course.
   * @returns An object containing an array of review records for the course.
   * @throws {BadRequestException} If no reviews are found.
   */
  public async getAllReviewsWithCourse(courseId: string) {
    const reviews = await this.prisma.review.findMany({ where: { courseId } });
    if (!reviews) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    return { data: reviews };
  }

  /**
   * Retrieves all reviews submitted by a specific student.
   *
   * @param studentId - The unique identifier of the student.
   * @returns An object containing an array of the student's review records.
   * @throws {BadRequestException} If no reviews are found.
   */
  public async getAllReviewsWithstudent(studentId: string) {
    const reviews = await this.prisma.review.findMany({ where: { studentId } });
    if (!reviews) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    return { data: reviews };
  }

  /**
   * Updates an existing review written by a specific student.
   *
   * Ownership is enforced by filtering on both `id` and `studentId`,
   * so a student cannot update another student's review.
   *
   * @param id - The unique identifier of the review to update.
   * @param dto - DTO containing the updated `rating` and/or `comment`.
   * @param studentId - The ID of the student making the update (ownership check).
   * @returns An object containing the updated review record.
   * @throws {BadRequestException} If the review is not found or doesn't belong to the student.
   */
  public async updateReview(
    id: string,
    dto: updateReviewDTO,
    studentId: string,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id, studentId },
    });
    if (!review) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    const Nreview = await this.prisma.review.update({
      where: { id },
      data: dto,
    });

    return { data: Nreview };
  }

  /**
   * Deletes a review written by a specific student.
   *
   * Ownership is enforced by filtering on both `id` and `studentId`,
   * so a student cannot delete another student's review.
   *
   * @param id - The unique identifier of the review to delete.
   * @param studentId - The ID of the student requesting the deletion (ownership check).
   * @returns A success message confirming deletion.
   * @throws {BadRequestException} If the review is not found or doesn't belong to the student.
   */
  public async deleteReview(id: string, studentId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id, studentId },
    });
    if (!review) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    await this.prisma.review.delete({ where: { id } });

    return { message: REVIEW_MESSAGE.DELETE_SUCCESSFUL };
  }
}