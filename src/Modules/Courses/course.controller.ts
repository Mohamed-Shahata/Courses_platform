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

  //Post ~/course/create
  @Post('create')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public createCourse(
    @CurrentUser('id') id: string,
    @Body() body: CreateCourseDTO,
  ) {
    return this.courseService.createCourse(body, id);
  }

  //Get ~/course/all
  @Get('all')
  @UseGuards(JwtAuthGuard)
  public getAllCourses() {
    return this.courseService.getAllCourses();
  }

  //Get ~/course/inst
  @Get('inst')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public getAllCoursesByInst(@CurrentUser('id') id: string) {
    return this.courseService.getAllCoursesByInst(id);
  }

  //Get ~/course/:id
  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  public getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  //Patch ~/course/update/:id
  @Patch('update/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public updateCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
    @Body() body: UpdateCourseDTO,
  ) {
    return this.courseService.updateCourse(body, id, instId);
  }

  //Delete ~/course/delete/:id
  @Delete('delete/:id')
  @Roles(ROLE.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  public deleteCourse(
    @CurrentUser('id') instId: string,
    @Param('id') id: string,
  ) {
    return this.courseService.deleteCourse(id, instId);
  }
}
