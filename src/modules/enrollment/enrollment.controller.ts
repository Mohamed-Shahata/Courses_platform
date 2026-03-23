import { Controller, Get, UseGuards, Param, Post } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Enrollment')
@ApiBearerAuth('access-token')
@Controller('enroll')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  // POST ~/enroll/:courseId
  @Post('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Enroll in a course (Student only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID to enroll in' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Already enrolled or course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  public enrollCourse(
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.enrollCourse(courseId, id);
  }

  // GET ~/enroll/:courseId
  @Get('/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all enrollments for current student (Student only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID (used for routing context)' })
  @ApiResponse({ status: 200, description: 'Returns list of student enrollments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  public allEnrollByUser(@CurrentUser('id') id: string) {
    return this.enrollmentService.allEnrollByStudent(id);
  }
}