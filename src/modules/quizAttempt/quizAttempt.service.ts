import { BadGatewayException, Injectable } from '@nestjs/common';
import { createQuizAttemptDTO } from './dto/createQuizAttempt.dto';
import { QUIZ_MESSAGE } from 'src/shared/constants/messages';
import { QuizRepository } from '../quiz/quiz.repository';
import { QuestionRepository } from '../question/question.repository';
import { QuizAttemptRepository } from './quizAttempt.repository';
import { LessonProgressRepository } from '../lessons/lessonProgress.repository';

@Injectable()
export class QuizAttemptService {
  constructor(
    private quizRepo: QuizRepository,
    private questionRepo: QuestionRepository,
    private quizAttemptRepo: QuizAttemptRepository,
    private lessonProgressRepo: LessonProgressRepository,
  ) {}

  public async submitQuiz(
    userId: string,
    dto: createQuizAttemptDTO,
    quizId: string,
  ) {
    const quiz = await this.quizRepo.find(quizId);

    if (!quiz) throw new BadGatewayException(QUIZ_MESSAGE.NO_QUIZ);

    const { answer } = dto;

    let score = 0;

    const questions = await this.questionRepo.findAllwithQuiz(quiz.id);

    questions.forEach((question) => {
      const userAnswer = answer.find((a) => a.questionId === question.id);

      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        score++;
      }
    });

    const total = questions.length;

    const percentage = (score / total) * 100;

    const passed = percentage >= 60 ? true : false;

    await this.quizAttemptRepo.create({
      score,
      passed,
      quiz: {
        connect: {
          id: quizId,
        },
      },
      student: {
        connect: {
          userId,
        },
      },
    });

    if (passed) {
      await this.lessonProgressRepo.create({
        completed: true,
        student: {
          connect: {
            userId,
          },
        },
        lesson: {
          connect: {
            id: quiz.lessonId!,
          },
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
