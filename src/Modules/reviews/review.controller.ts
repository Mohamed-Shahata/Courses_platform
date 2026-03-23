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
import { ReviewServices } from './review.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { updateReviewDTO } from './dto/updateReview.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { addReviewDTO } from './dto/addReview.dto';
import { ROLE } from 'generated/prisma/enums';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Review')
@ApiBearerAuth('access-token')
@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewServices) {}

  // POST ~/review/create/:courseId
  @Post('create/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Create a review for a course (Student only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID to review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Already reviewed or not enrolled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  public createReview(
    @Body() body: addReviewDTO,
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.reviewService.createReview(body, id, courseId);
  }

  // GET ~/review/allWithCourse/:courseId
  @Get('allWithCourse/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all reviews for a specific course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Returns list of reviews for the course' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  public getAllWithCourse(@Param('courseId') courseId: string) {
    return this.reviewService.getAllReviewsWithCourse(courseId);
  }

  // GET ~/review/allWithStudent
  @Get('allWithStudent')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all reviews by current student (Student only)' })
  @ApiResponse({ status: 200, description: 'Returns list of student reviews' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  public getAllWithStudent(@CurrentUser('id') id: string) {
    return this.reviewService.getAllReviewsWithstudent(id);
  }

  // PATCH ~/review/update/:id
  @Patch('update/:id')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update a review (Student only - own reviews)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  public updateReview(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() body: updateReviewDTO,
  ) {
    return this.reviewService.updateReview(id, body, studentId);
  }

  // DELETE ~/review/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Delete a review (Student only - own reviews)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  public deleteReview(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
  ) {
    return this.reviewService.deleteReview(id, studentId);
  }
}