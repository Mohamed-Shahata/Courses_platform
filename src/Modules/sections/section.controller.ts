import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';
import { ApiSecurity } from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtPayloadType } from 'src/shared/types/jwtPayloadType';
import { addSectionDTO } from './dto/create.dto';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { updateSectionDTO } from './dto/update.dto';

@Controller('section')
export class SectionController {
  constructor(private sectionService: SectionService) {}

  // Post ~/seation/create
  @Post('create')
  @Roles(RoleUser.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiSecurity('bearer')
  public async createSection(
    @CurrentUser() user: JwtPayloadType,
    @Body() body: addSectionDTO,
    @Query('courseId') courseId: string,
  ) {
    return this.sectionService.createSection(body, courseId, user.id);
  }

  // Get ~/section/all/course
  @Get('all/course')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('bearer')
  public getAllWithCourse(@Query('courseId') courseId: string) {
    return this.sectionService.getSectionsWithCourse(courseId);
  }

  //Get ~/section/progress
  @Get('progress')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('bearer')
  public getProgressOfSection(
    @Query('courseId') courseId: string,
    @Query('userId') userId: string,
  ) {
    return this.sectionService.getSectionProgress(courseId, userId);
  }

  //Patch ~/section/update
  @Patch('update')
  @Roles(RoleUser.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiSecurity('bearer')
  public updateCourse(
    @CurrentUser() user: JwtPayloadType,
    @Body() data: updateSectionDTO,
    @Query('sectionId') sectionId: string,
  ) {
    return this.sectionService.updateSection(data, sectionId, user.id);
  }

  //Delete ~/section/delete
  @Delete('delete')
  @Roles(RoleUser.INSTRUCTOR)
  @UseGuards(AuthRoleGuard)
  @ApiSecurity('bearer')
  public deleteCourse(
    @CurrentUser() user: JwtPayloadType,
    @Query('sectionId') sectionId: string,
  ) {
    return this.sectionService.deleteSection(sectionId, user.id);
  }
}
