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
import { QuestionService } from './question.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ROLE } from 'generated/prisma/enums';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { createQuestionDTO } from './dto/createQuestion.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateQuestionDTO } from './dto/updateQuestion.dto';

@Controller('question')
export class QuestionController {
  constructor(private questionService: QuestionService) {}
  //Post ~/question/create
  @Post('create/:quizId')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public createQuestion(
    @CurrentUser('id') instId: string,
    @Body() body: createQuestionDTO,
    @Param('quizId') quizId: string,
  ) {
    return this.questionService.createQuestion(quizId, body, instId);
  }

  //Get ~/question/all/:quizId
  @Get('all/:quizId')
  @UseGuards(JwtAuthGuard)
  public getAllQuestionWithQuiz(@Param('quizId') quizId: string) {
    return this.questionService.getAllQuestionWithQuiz(quizId);
  }

  //Get ~/question/:id
  @Get('/:id')
  public getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionWithId(id);
  }

  //Patch ~/question/update/:id
  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public updateQuestion(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
    @Body() body: updateQuestionDTO,
  ) {
    return this.questionService.updateQuestion(id, body, instId);
  }

  //Delete ~/question/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public deleteQuestion(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
  ) {
    return this.questionService.deleteQuestion(id, instId);
  }
}
