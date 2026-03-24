import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { QuizAttemptService } from './quizAttempt.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { createQuizAttemptDTO } from './dto/createQuizAttempt.dto';

@Controller('quizAttempt')
export class QuizAttemptController {
  constructor(private quizAttemptService: QuizAttemptService) {}

  @Post('submit/:quizId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public submitQuiz(
    @CurrentUser('id') id: string,
    @Param('quizId') quizId: string,
    @Body() body: createQuizAttemptDTO,
  ) {
    return this.quizAttemptService.submitQuiz(id, body, quizId);
  }
}
