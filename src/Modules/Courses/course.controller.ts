import {
  Body,
  Controller,
  UseGuards,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { ROLE } from 'generated/prisma/enums';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { UpdateCourseDTO } from './dto/updateCourse.dto';

@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post('create')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async createCourse(
    @CurrentUser('id') id: string,
    @Body() body: CreateCourseDTO,
  ) {
    return await this.courseService.createCourse(body, id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  public async getAllCourses() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.courseService.getAllCourses();
  }

  @Get('inst')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async getAllCoursesByInst(@CurrentUser('id') id: string) {
    return await this.courseService.getAllCoursesByInst(id);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public async getCourseById(@Param('id') id: string) {
    return await this.courseService.getCourseById(id);
  }

  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async updateCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
    @Body() body: UpdateCourseDTO,
  ) {
    return await this.courseService.updateCourse(body, id, instId);
  }

  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public async deleteCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
  ) {
    return await this.courseService.deleteCourse(id, instId);
  }
}
