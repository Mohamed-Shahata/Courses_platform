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
import { updateLessonStatus } from './dto/updateLessonStatus.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Lesson')
@ApiBearerAuth('access-token')
@Controller('lesson')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  // POST ~/lesson/create/:sectionId
  @Post('create/:sectionId')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @UseInterceptors(FileInterceptor('videoURL'))
  @ApiOperation({ summary: 'Create a new lesson with video (Instructor only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videoURL: {
          type: 'string',
          format: 'binary',
          description: 'Lesson video file',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        order: { type: 'number' },
      },
      required: ['videoURL', 'title'],
    },
  })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor role required',
  })
  @ApiResponse({ status: 404, description: 'section not found' })
  public createLesson(
    @CurrentUser('id') instId: string,
    @Param('sectionId') sectionId: string,
    @Body()
    body: addLessonDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.lessonService.createLesson(body, instId, file.path, sectionId);
  }

  // GET ~/lesson/all/:courseId
  @Get('all/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all lessons for a section' })
  @ApiParam({ name: 'sectionId', description: 'section ID' })
  @ApiResponse({ status: 200, description: 'Returns list of lessons' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'section not found' })
  public getAllLessonWithCourse(@Param('sectionId') sectionId: string) {
    return this.lessonService.getAlllessonWithSection(sectionId);
  }

  // GET ~/lesson/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Returns lesson details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  public getLessonById(@Param('id') id: string) {
    return this.lessonService.getLessonById(id);
  }

  // PATCH ~/lesson/update/:id
  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update lesson details (Instructor only)' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor role required',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  public updateLesson(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: updateLessonDTO,
  ) {
    return this.lessonService.updateLesson(body, id, userId);
  }

  // DELETE ~/lesson/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Delete a lesson (Instructor only)' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor role required',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  public deleteLesson(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.lessonService.deleteLesson(id, userId);
  }

  // PATCH ~/lesson/admin/:id/status
  @Patch('admin/:id/status')
  @Roles(ROLE.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update lesson status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  public updateLessonStatus(
    @Param('id') id: string,
    @Body() body: updateLessonStatus,
  ) {
    return this.lessonService.updateLessonStatus(id, body);
  }
}
