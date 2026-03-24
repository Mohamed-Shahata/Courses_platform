import {
  Body,
  Controller,
  UseGuards,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Course')
@ApiBearerAuth('access-token')
@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  //POST ~/course/create/:categoryId
  @Post('create/:categoryId')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiOperation({ summary: 'Create a new course (Instructor only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        isFree: { type: 'boolean' },
        level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
        language: { type: 'string' },
        tags: { type: 'string', example: 'tag1,tag2,tag3' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Instructor role required' })
  public createCourse(
    @CurrentUser('id') id: string,
    @Body() body: CreateCourseDTO,
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.courseService.createCourse(body, id, categoryId, file.path);
  }

  //GET ~/course/all
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Returns all courses' })
  public getAllCourses() {
    return this.courseService.getAllCourses();
  }

  //GET ~/course/inst
  @Get('inst')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all courses by instructor (Instructor only)' })
  @ApiResponse({ status: 200, description: 'Returns instructor courses' })
  public getAllCoursesByInst(@CurrentUser('id') id: string) {
    return this.courseService.getAllCoursesByInst(id);
  }

  //GET ~/course/filter
  @Get('filter')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Filter courses by category or tag' })
  @ApiResponse({ status: 200, description: 'Returns filtered courses' })
  public filterCourses(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.courseService.filterCourses(category, tag);
  }

  //GET ~/course/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  public getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  //PATCH ~/course/update/:id
  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Update course (Instructor only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your course' })
  public updateCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
    @Body() body: UpdateCourseDTO,
  ) {
    return this.courseService.updateCourse(body, id, instId);
  }

  //DELETE ~/course/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Delete course (Instructor only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  public deleteCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
  ) {
    return this.courseService.deleteCourse(id, instId);
  }

  // Get ~course/progress/:courseId
  @Get('progress/:courseId')
  @Roles(ROLE.STUDENT)
  @UseGuards(AuthRoleGuard)
  public progressCourse(
    @CurrentUser('id') id: string,
    @Param('courseId') courseId: string,
  ) {
    return this.courseService.getCourseProgress(courseId, id);
  }
}
