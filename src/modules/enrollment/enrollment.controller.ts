import { Controller, Get, UseGuards, Param, Post } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('enroll')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  //Post ~/enroll/:courseId
  @Post('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public enrollCourse(
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.enrollCourse(courseId, id);
  }

  //Get ~/enroll/:courseId
  @Get('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public AllEnrollByUser(@CurrentUser('id') id: string) {
    return this.enrollmentService.allEnrollByStudent(id);
  }
}
