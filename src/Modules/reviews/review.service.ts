import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { addReviewDTO } from './dto/addReview.dto';
import {
  COURSE_MESSAGE,
  REVIEW_MESSAGE,
  USER_MESSAGES,
} from 'src/shared/constants/messages';
import { updateReviewDTO } from './dto/updateReview.dto';

@Injectable()
export class ReviewServices {
  constructor(private prisma: DataBaseService) {}

  public async createReview(
    dto: addReviewDTO,
    studentId: string,
    courseId: string,
  ) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student)
      throw new BadRequestException(USER_MESSAGES.NOT_FOUND_STUDENT);

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new BadRequestException(COURSE_MESSAGE.NOT_FOUND_COURSE);

    const existing = await this.prisma.review.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });
    if (existing)
      throw new BadRequestException(REVIEW_MESSAGE.REVIEWED_ALREADY);

    console.log(dto);
    const review = await this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
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

    return { data: review };
  }

  public async getAllReviewsWithCourse(courseId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { courseId },
    });

    if (!reviews) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    return { data: reviews };
  }

  public async getAllReviewsWithstudent(studentId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { studentId },
    });

    if (!reviews) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    return { data: reviews };
  }

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

  public async deleteReview(id: string, studentId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id, studentId },
    });

    if (!review) throw new BadRequestException(REVIEW_MESSAGE.NO_REVIEWS);

    await this.prisma.review.delete({ where: { id } });

    return { message: REVIEW_MESSAGE.DELETE_SUCCESSFUL };
  }
}
