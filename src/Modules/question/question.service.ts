import { BadRequestException, Injectable } from '@nestjs/common';
import { createQuestionDTO } from './dto/createQuestion.dto';
import { QUESTION_MESSAGE, QUIZ_MESSAGE } from 'src/shared/constants/messages';
import { updateQuestionDTO } from './dto/updateQuestion.dto';
import { QuestionRepository } from './question.repository';
import { QuizRepository } from '../quiz/quiz.repository';

@Injectable()
export class QuestionService {
  constructor(
    private questionRepo: QuestionRepository,
    private quizRep: QuizRepository,
  ) {}

  public async createQuestion(
    quizId: string,
    dto: createQuestionDTO,
    userId: string,
  ) {
    const quiz = await this.quizRep.findByIdAndUser(quizId, userId);

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ);

    const { question, options, correctAnswer } = dto;

    const questionr = await this.questionRepo.create({
      question,
      options,
      correctAnswer,
      quiz: {
        connect: {
          id: quizId,
        },
      },
    });

    return { data: questionr };
  }

  public async getAllQuestionWithQuiz(quizId: string) {
    const questions = await this.questionRepo.findAllwithQuiz(quizId);

    if (!questions)
      throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION_FOR_QUIZ);

    return { data: questions };
  }

  public async getQuestionWithId(id: string) {
    const question = await this.questionRepo.find(id);

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    return { data: question };
  }

  public async updateQuestion(
    id: string,
    dto: updateQuestionDTO,
    userId: string,
  ) {
    const question = await this.questionRepo.findWithIdAndUser(id, userId);

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    const Nquestion = await this.questionRepo.update(question.id, dto);

    return { data: Nquestion };
  }

  public async deleteQuestion(id: string, userId: string) {
    const question = await this.questionRepo.findWithIdAndUser(id, userId);

    if (!question) throw new BadRequestException(QUESTION_MESSAGE.NO_QUESTION);

    await this.questionRepo.delete(id);

    return { message: QUESTION_MESSAGE.NO_QUESTION };
  }
}
