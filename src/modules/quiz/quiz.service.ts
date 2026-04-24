import { BadRequestException, Injectable } from '@nestjs/common';
import { createQuizDTO } from './dto/createQuiz.dto';
import { LESSON_MESSAGE, QUIZ_MESSAGE } from 'src/shared/constants/messages';
import { LessonRepository } from '../lessons/lesson.repository';
import { QuizRepository } from './quiz.repository';

@Injectable()
export class QuizService {
  constructor(
    private quizRepo: QuizRepository,
    private lessonRepo: LessonRepository,
  ) {}

  public async createQuiz(
    dto: createQuizDTO,
    lessonId: string,
    userId: string,
  ) {
    const lesson = await this.lessonRepo.findByIdByUserId(lessonId, userId);
    if (!lesson) throw new BadRequestException(LESSON_MESSAGE.NO_LESSON);

    const quiz = await this.quizRepo.create({
      name: dto.name,
      type: dto.type,
      lesson: { connect: { id: lesson.id } },
    });

    return { data: quiz };
  }

  public async getAllQuizBySection(sectionId: string) {
    const quizes = await this.quizRepo.findManyOfSection(sectionId);

    return { data: quizes };
  }

  public async getQuizByLesson(lessonId: string) {
    const quiz = await this.quizRepo.findByLesson(lessonId);

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ_FOR_LESSON);

    return { data: quiz };
  }

  public async deleteQuiz(id: string, userId: string) {
    const quiz = await this.quizRepo.findByIdAndUser(id, userId);

    if (!quiz) throw new BadRequestException(QUIZ_MESSAGE.NO_QUIZ);

    await this.quizRepo.delete(id);

    return { message: QUIZ_MESSAGE.DELETE_QUIZ };
  }
}
