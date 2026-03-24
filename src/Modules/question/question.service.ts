import { BadRequestException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { createQuestionDTO } from './dto/createQuestion.dto';
import { QUESTION_MESSAGE, QUIZ_MESSAGE } from 'src/shared/constants/messages';
import { updateQuestionDTO } from './dto/updateQuestion.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: DataBaseService) {}

  public async createQuestion(
    quizId: string,
    dto: createQuestionDTO,
    instructorId: string,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id: quizId,
        lesson: {
          course: {
            instructorId,
          },
        },
      },
    });

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ);

    const { question, options, correctAnswer } = dto;
    const questionr = await this.prisma.question.create({
      data: {
        question,
        options,
        correctAnswer,
        quiz: {
          connect: {
            id: quizId,
          },
        },
      },
    });

    return { data: questionr };
  }

  public async getAllQuestionWithQuiz(quizId: string) {
    const questions = await this.prisma.question.findMany({
      where: { quizId },
    });

    if (!questions)
      throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION_FOR_QUIZ);

    return { data: questions };
  }

  public async getQuestionWithId(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    return { data: question };
  }

  public async updateQuestion(
    id: string,
    dto: updateQuestionDTO,
    instructorId: string,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id, quiz: { lesson: { course: { instructorId } } } },
    });

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    const Nquestion = await this.prisma.question.update({
      where: { id },
      data: dto,
    });

    return { data: Nquestion };
  }

  public async deleteQuestion(id: string, instructorId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id, quiz: { lesson: { course: { instructorId } } } },
    });

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    await this.prisma.question.delete({
      where: { id },
    });

    return { message: QUESTION_MESSAGE.NO_QUESTION };
  }
}
