import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/user-role.decorator';
import { RoleUser } from 'src/shared/enums/RoleUser.enum';
import { AuthRoleGuard } from 'src/shared/guards/auth-role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private studentService: StudentService) {}

  //Get ~/student/me
  @Get('me')
  @Roles(RoleUser.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth('access-token')
  public async getMe(@CurrentUser('id') id: string) {
    return this.studentService.findMe(id);
  }

  //Delete ~/student/delete
  @Delete('delete')
  @Roles(RoleUser.STUDENT)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth('access-token')
  public async sofyDelete(@CurrentUser('id') id: string) {
    return this.studentService.deleteAccount(id);
  }
}
