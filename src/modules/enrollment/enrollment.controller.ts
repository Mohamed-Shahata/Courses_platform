import { Controller, Get, UseGuards, Param, Post, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('enroll')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  // POST ~/enroll/:courseId/create
  @Post('/:courseId/create')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public async enrollCourse(
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return await this.enrollmentService.enrollCourse(courseId, id);
  }

  // GET ~/enroll/all
  @Get('/all')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public async AllEnrollByUser(@CurrentUser('id') id: string) {
    return await this.enrollmentService.allEnrollByStudent(id);
  }

  // DELETE ~/enroll/:courseId/cancel
  @Get('/:courseId/cancel')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public async CancelEnroll(@CurrentUser('id') userId: string, @Query("courseId") courseId) {
    return await this.enrollmentService.cancelEnroll(courseId ,userId);
  }
}
