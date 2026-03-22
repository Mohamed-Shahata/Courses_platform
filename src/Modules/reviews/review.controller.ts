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

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewServices) {}

  // Post ~/review/create/:courseId
  @Post('create/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public createReview(
    @Body() body: addReviewDTO,
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.reviewService.createReview(body, id, courseId);
  }

  // Get ~/review/allWithCourse/:courseId
  @Get('allWithCourse/:courseId')
  @UseGuards(JwtAuthGuard)
  public getAllWithCourse(@Param('courseId') courseId: string) {
    return this.reviewService.getAllReviewsWithCourse(courseId);
  }

  // Get ~/review/allWithStudent
  @Get('allWithStudent')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public getAllWithStudent(@CurrentUser('id') id: string) {
    return this.reviewService.getAllReviewsWithstudent(id);
  }

  // Patch ~/review/update/:id
  @Patch('update/:id')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public updateReview(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
    @Body() body: updateReviewDTO,
  ) {
    return this.reviewService.updateReview(id, body, studentId);
  }

  // Delete ~/review/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public deleteReview(
    @CurrentUser('id') studentId: string,
    @Param('id') id: string,
  ) {
    return this.reviewService.deleteReview(id, studentId);
  }
}
