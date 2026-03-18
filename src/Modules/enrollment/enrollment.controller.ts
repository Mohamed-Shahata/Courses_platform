import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('enroll')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  @Get('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public async enrollCourse(
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return await this.enrollmentService.enrollCourse(courseId, id);
  }

  @Get('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public async AllEnrollByUser(@CurrentUser('id') id: string) {
    return await this.enrollmentService.AllEnrollByStudent(id);
  }
}
