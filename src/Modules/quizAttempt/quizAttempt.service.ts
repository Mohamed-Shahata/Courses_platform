import { BadGatewayException, Injectable } from '@nestjs/common';
import { DataBaseService } from '../db/database.service';
import { createQuizAttemptDTO } from './dto/createQuizAttempt.dto';
import { QUIZ_MESSAGE } from 'src/shared/constants/messages';

@Injectable()
export class QuizAttemptService {
  constructor(private prisma: DataBaseService) {}

  public async submitQuiz(
    studentId: string,
    dto: createQuizAttemptDTO,
    quizId: string,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, lesson: true },
    });

    if (!quiz) throw new BadGatewayException(QUIZ_MESSAGE.NO_QUIZ);

    const { answer } = dto;

    let score = 0;

    quiz.questions.forEach((question) => {
      const userAnswer = answer.find((a) => a.questionId === question.id);

      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        score++;
      }
    });

    const total = quiz.questions.length;

    const percentage = (score / total) * 100;

    const passed = percentage >= 60 ? true : false;

    await this.prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        score,
        passed,
      },
    });

    if (passed) {
      await this.prisma.lessonProgress.create({
        data: {
          studentId,
          lessonId: quiz.lessonId,
          completed: true,
        },
      });
    }

    return {
      data: {
        score,
        total,
        passed,
        percentage,
      },
    };
  }
}
