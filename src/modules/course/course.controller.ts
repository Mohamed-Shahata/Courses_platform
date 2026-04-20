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
  BadRequestException,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { COURSE_MESSAGE } from 'src/shared/constants/messages';

@ApiTags('Course')
@ApiBearerAuth('access-token')
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  //POST ~/courses/create
  @Post('create')
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
        categoryName: { type: 'string' },
        price: { type: 'number' },
        isFree: { type: 'boolean' },
        level: {
          type: 'string',
          enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        },
        language: { type: 'string' },
        tags: { type: 'string', example: 'tag1,tag2,tag3' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor role required',
  })
  public createCourse(
    @CurrentUser('id') id: string,
    @Body() body: CreateCourseDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException(COURSE_MESSAGE.IMAGE_COURSE_EMPTY);
    return this.courseService.createCourse(body, id, file.path);
  }

  //GET ~/courses
  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all courses and Filter courses by category or tag',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all courses or filtered courses',
  })
  public getAllCourses(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ) {
    return this.courseService.getAllCourses(category, tag);
  }

  //GET ~/courses/inst
  @Get('inst')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiOperation({ summary: 'Get all courses by instructor (Instructor only) ' })
  @ApiResponse({ status: 200, description: 'Returns instructor courses' })
  public getAllCoursesByInst(@CurrentUser('id') id: string) {
    return this.courseService.getAllCoursesByInst(id);
  }

  //GET ~/courses/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  public getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  //PATCH ~/courses/update/:id
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

  //DELETE ~/courses/delete/:id
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
}
