import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { createQuizDTO } from './dto/createQuiz.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@Controller('quiz')
export class QuizController {
  constructor(private quizService: QuizService) {}

  //Post ~/quiz/create/:lessonId
  @Post('create/:lessonId')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async createQuiz(
    @CurrentUser('id') id: string,
    @Body() body: createQuizDTO,
    @Param('lessonId') lessonId: string,
  ) {
    return this.quizService.createQuiz(body, lessonId, id);
  }

  //Get ~/quiz/all/:courseId
  @Get('all/:sectionId')
  @UseGuards(AuthRoleGuard)
  public async getAllQuizWithCourse(@Param('sectionId') sectionId: string) {
    return this.quizService.getAllQuizBySection(sectionId);
  }

  //Get ~/quiz/:lessonId
  @Get('/:lessonId')
  @UseGuards(JwtAuthGuard)
  public async getQuizByLesson(@Param('lessonId') lessonId: string) {
    return this.quizService.getQuizByLesson(lessonId);
  }

  //Patch ~/quiz/update/:id
  @Patch('update')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async updateQuiz() {}

  //Delete ~/quiz/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async deleteQuiz(
    @Param('id') id: string,
    @CurrentUser('id') instId: string,
  ) {
    return this.quizService.deleteQuiz(id, instId);
  }
}
