import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { createQuizDTO } from './dto/createQuiz.dto';
import { LESSON_MESSAGE, QUIZ_MESSAGE } from 'src/shared/constants/messages';

@Injectable()
export class QuizService {
  constructor(private prisma: DataBaseService) {}

  public async createQuiz(
    dto: createQuizDTO,
    lessonId: string,
    instructorId: string,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId, course: { instructorId } },
    });

    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    const quiz = await this.prisma.quiz.create({
      data: {
        name: dto.name,
        instructorId,
        lessonId: lessonId,
      },
    });

    return { data: quiz };
  }

  public async getAllQuizByCourse(courseId: string) {
    const quizes = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessonSessions: {
          include: {
            lessons: {
              include: {
                quiz: true,
              },
            },
          },
        },
      },
    });

    return { data: quizes };
  }

  public async getQuizByLesson(lessonId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { lessonId },
    });

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ_FOR_LESSON);

    return { data: quiz };
  }

  public async deleteQuiz(id: string, instructorId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id, instructorId },
    });

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ);

    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: QUIZ_MESSAGE.DELETE_QUIZ };
  }
}
