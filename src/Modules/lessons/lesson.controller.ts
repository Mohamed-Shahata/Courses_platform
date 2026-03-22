import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { addLessonDTO } from './dto/addLesson.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateLessonDTO } from './dto/updateLesson.dto';
import { ROLE } from 'generated/prisma/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@Controller('lesson')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  // Post ~/lesson/create/:courseId
  @Post('create/:courseId')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @UseInterceptors(FileInterceptor('videoURL'))
  public createLesson(
    @CurrentUser('id') instId: string,
    @Param('courseId') courseId: string,
    @Body() body: addLessonDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.lessonService.createLesson(body, instId, courseId, file.path);
  }

  // Get ~/lesson/all/:courseId
  @Get('all/:courseId')
  @UseGuards(JwtAuthGuard)
  public getAllLessonWithCourse(@Param('courseId') courseId: string) {
    return this.lessonService.getAlllessonWithCourse(courseId);
  }

  // Get ~/lesson/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public getLessonById(@Param('id') id: string) {
    return this.lessonService.getLessonById(id);
  }

  // Patch ~/lesson/update/:id
  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public updateLesson(@Param('id') id: string, @Body() body: updateLessonDTO) {
    return this.lessonService.updateLesson(body, id);
  }

  // Delete ~/lesson/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public deleteLesson(@Param('id') id: string) {
    return this.lessonService.deleteLesson(id);
  }
}
